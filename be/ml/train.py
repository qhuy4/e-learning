"""Skill Profile v2 — offline train + export (Bước 5).

Mỗi skill một XGBoost regressor, xuất `models/skill-{code}.json` đúng
export contract của SkillModelService (be/src/modules/skill-profiling/
application/skill-model.service.ts — doc-comment đầu file).

Label (đã chốt):
  REAL    = 0.6·features.rating + 0.4·features.completion   (rating đã /5,
            completion đã /100 — cả hai key phải có trong feature row)
  SILVER  = 0.6·global_rating/5 + 0.4·global_progress/100   (toàn catalog
            instructor — dùng khi thiếu attribution thật)
  không có label ở cả 2 tầng → loại (instructor-skill không train)

Features: union các key JSONB fv1 (sort alphabetically — chuẩn deterministic).
Giá trị thiếu → NaN → XGBoost missing direction, khớp default direction `d`
mà inference TS dùng (R2: thiếu feature không phạt).

Base score: tính EMPIRICALLY (pred[0] − Σ leaf paths) để không phụ thuộc
cách xgboost version lưu base_score trong config; verify round-trip toàn bộ
rows trước khi ghi file.

Chạy: py ml/train.py   (env: PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD)
"""

import json
import math
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import psycopg2
import xgboost as xgb

MODEL_VERSION = "v2"
FEATURE_VERSION = "fv1"  # phải khớp FEATURE_VERSION trong extractor
SEED = 42
ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "models"

DB = {
    "host": os.environ.get("PGHOST", "localhost"),
    "port": os.environ.get("PGPORT", "5433"),
    "dbname": os.environ.get("PGDATABASE", "edu-db"),
    "user": os.environ.get("PGUSER", "postgres"),
    "password": os.environ.get("PGPASSWORD", "123"),
}


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def load_training_rows(conn):
    """Feature rows + label tiers + skill meta."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT f.instructor_id, f.skill_id, f.features, s.code, s.category
            FROM instructor_skill_features f
            JOIN instructor_skills s ON s.id = f.skill_id AND s.is_active
            """
        )
        feature_rows = [
            {
                "profile_id": r[0],
                "skill_id": r[1],
                "features": r[2] or {},
                "code": r[3],
                "category": r[4],
            }
            for r in cur.fetchall()
        ]

        # Silver labels: global rating (stars) + global progress (%) per profile.
        cur.execute(
            """
            SELECT p.id, AVG(r.rating)
            FROM instructor_profiles p
            JOIN courses c ON c.instructor_id = p.user_id AND c.deleted_at IS NULL
            JOIN reviews r ON r.course_id = c.id AND r.deleted_at IS NULL
              AND (r.status = 1 OR r.status IS NULL)
            GROUP BY p.id
            """
        )
        global_rating = {r[0]: float(r[1]) for r in cur.fetchall() if r[1] is not None}
        cur.execute(
            """
            SELECT p.id, AVG(e.progress)
            FROM instructor_profiles p
            JOIN courses c ON c.instructor_id = p.user_id AND c.deleted_at IS NULL
            JOIN enrollments e ON e.course_id = c.id AND e.deleted_at IS NULL
            GROUP BY p.id
            """
        )
        global_progress = {r[0]: float(r[1]) for r in cur.fetchall() if r[1] is not None}

        cur.execute("SELECT id, code FROM instructor_skills WHERE is_active ORDER BY display_order")
        skills = [(r[0], r[1]) for r in cur.fetchall()]

    return feature_rows, global_rating, global_progress, skills


def make_label(row, global_rating, global_progress):
    """(y, tier) hoặc (None, None) khi không có label."""
    feat = row["features"]
    if "rating" in feat and "completion" in feat:
        return clamp01(0.6 * float(feat["rating"]) + 0.4 * float(feat["completion"])), "real"
    g_rating = global_rating.get(row["profile_id"])
    g_progress = global_progress.get(row["profile_id"])
    if g_rating is not None and g_progress is not None:
        return clamp01(0.6 * (g_rating / 5.0) + 0.4 * (g_progress / 100.0)), "silver"
    return None, None


def build_feature_names(all_rows):
    names = sorted({k for r in all_rows for k in r["features"].keys()})
    return names


def to_matrix(rows, feature_names):
    mat = np.full((len(rows), len(feature_names)), np.nan, dtype=np.float64)
    for i, r in enumerate(rows):
        for j, name in enumerate(feature_names):
            v = r["features"].get(name)
            if v is not None:
                x = float(v)
                mat[i, j] = x if math.isfinite(x) else np.nan
    return mat


def flatten_tree(node, out):
    """XGBoost >= 2.x dump lồng 'children' → list phẳng (pre-order)."""
    out.append(node)
    for child in node.get("children", []):
        flatten_tree(child, out)


def convert_tree(dump_str, feature_index):
    """JSON dump của xgboost → contract node của SkillModelService."""
    parsed = json.loads(dump_str)
    # Legacy flat format: dump là list node với yes/no index sẵn.
    if isinstance(parsed, list):
        flat = parsed
    else:
        flat = []
        flatten_tree(parsed, flat)
    idmap = {n["nodeid"]: i for i, n in enumerate(flat)}
    out = []
    for n in flat:
        if "leaf" in n:
            out.append({"v": float(n["leaf"])})
        else:
            yes, no = n["yes"], n["no"]
            missing = n.get("missing", yes)
            out.append(
                {
                    "f": feature_index[n["split"]],
                    "t": float(n["split_condition"]),
                    "l": idmap[yes],
                    "r": idmap[no],
                    "d": 0 if missing == yes else 1,
                }
            )
    return out


def manual_predict(row_values, feature_names, trees, base_score):
    """ replica đúng thuật toán inference của SkillModelService.predict()."""
    total = base_score
    for tree in trees:
        i, steps = 0, 0
        while True:
            node = tree[i]
            if "v" in node:
                total += node["v"]
                break
            raw = row_values[node["f"]]  # None = missing
            if raw is None or (isinstance(raw, float) and math.isnan(raw)):
                i = node["l"] if node.get("d", 0) == 0 else node["r"]
            else:
                i = node["l"] if raw < node["t"] else node["r"]
            steps += 1
            if steps > 10000:
                raise RuntimeError("malformed tree (cycle?)")
    return total


def train_and_export(conn, seed=SEED):
    feature_rows, global_rating, global_progress, skills = load_training_rows(conn)
    if not feature_rows:
        print("No instructor_skill_features rows — run refresh first.")
        return {}

    feature_names = build_feature_names(feature_rows)
    feature_index = {name: i for i, name in enumerate(feature_names)}
    print(f"Feature contract ({len(feature_names)}): {', '.join(feature_names)}")

    by_skill = {}
    n_real = n_silver = n_excluded = 0
    for r in feature_rows:
        y, tier = make_label(r, global_rating, global_progress)
        if y is None:
            n_excluded += 1
            continue
        if tier == "real":
            n_real += 1
        else:
            n_silver += 1
        by_skill.setdefault(r["code"], []).append((r, y, tier))

    print(f"Labels: real={n_real} silver={n_silver} excluded={n_excluded}")

    MODELS_DIR.mkdir(exist_ok=True)
    exported = {}
    for skill_id, code in skills:
        samples = by_skill.get(code, [])
        if not samples:
            print(f"  {code}: 0 labeled samples — skipped (no model file)")
            continue
        rows = [s[0] for s in samples]
        y = np.array([s[1] for s in samples], dtype=np.float64)
        tiers = [s[2] for s in samples]
        X = to_matrix(rows, feature_names)

        dmat = xgb.DMatrix(X, label=y, feature_names=feature_names)
        booster = xgb.train(
            {
                "objective": "reg:squarederror",
                "max_depth": 3,
                "eta": 0.1,
                "subsample": 0.8,
                "colsample_bytree": 0.8,
                "min_child_weight": 1,
                "lambda": 1.0,
                "seed": seed,
                "tree_method": "hist",
            },
            dmat,
            num_boost_round=50,
        )
        preds = booster.predict(dmat)
        dumps = booster.get_dump(dump_format="json")
        trees = [convert_tree(d, feature_index) for d in dumps]

        # base_score empirical: pred[0] − Σ contribution cây row 0, tính bằng
        # CHÍNH thuật toán inference (base=0) → tự khớp theo construction.
        row_values = [None if np.isnan(v) else float(v) for v in X[0]]
        base_score = float(preds[0] - manual_predict(row_values, feature_names, trees, 0.0))

        # Round-trip verify: inference TS phải khớp booster.predict mọi row.
        max_err = 0.0
        for i in range(len(rows)):
            row_values = [None if np.isnan(v) else float(v) for v in X[i]]
            got = manual_predict(row_values, feature_names, trees, base_score)
            max_err = max(max_err, abs(got - float(preds[i])))
        if max_err > 1e-4:
            raise RuntimeError(f"{code}: export round-trip mismatch {max_err}")

        mae = float(np.mean(np.abs(preds - y)))
        n_real_k = tiers.count("real")
        n_silver_k = len(tiers) - n_real_k
        payload = {
            "model_version": MODEL_VERSION,
            "feature_version": FEATURE_VERSION,
            "skill_code": code,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "features": feature_names,
            "base_score": base_score,
            "quantiles": {
                "y_p25": float(np.percentile(y, 25)),
                "y_p50": float(np.percentile(y, 50)),
                "y_p75": float(np.percentile(y, 75)),
            },
            "trees": trees,
            "train_meta": {
                "n_labeled": len(y),
                "n_real": n_real_k,
                "n_silver": n_silver_k,
                "mae": round(mae, 6),
                "seed": seed,
            },
        }
        out = MODELS_DIR / f"skill-{code}.json"
        out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        exported[code] = payload["train_meta"]
        print(
            f"  {code}: n={len(y)} (real={n_real_k} silver={n_silver_k}) "
            f"mae={mae:.4f} trees={len(trees)} roundtrip_err={max_err:.2e} -> {out.name}"
        )

    print(f"Exported {len(exported)} model(s) to {MODELS_DIR}")
    return exported


def main():
    try:
        conn = psycopg2.connect(**DB)
    except psycopg2.OperationalError as e:
        print(f"DB connect failed: {e}", file=sys.stderr)
        sys.exit(1)
    try:
        train_and_export(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
