/**
 * scan-dupes.ts — dev helper: lists EVERY duplicate question stem per seed exam
 * (validateExamContent stops at the first one; this prints them all at once).
 *
 * Run: npx ts-node src/database/scan-dupes.ts
 */
import { SEED_EXAMS } from './seed-content';

for (const exam of SEED_EXAMS) {
  const seen = new Map<string, string[]>();
  const visit = (q: { q: string }, label: string) => {
    const stem = q.q.trim().replace(/\s+/g, ' ');
    const arr = seen.get(stem) ?? [];
    arr.push(label);
    seen.set(stem, arr);
  };

  exam.sections.forEach((section) => {
    (section.questions ?? []).forEach((q, qi) =>
      visit(q, `section "${section.name}" direct q${qi + 1}`),
    );
    (section.groups ?? []).forEach((g, gi) =>
      g.questions.forEach((q, qi) =>
        visit(q, `section "${section.name}" group ${gi + 1} (${g.title ?? ''}) q${qi + 1}`),
      ),
    );
  });

  console.log(`\n=== ${exam.title} ===`);
  let dupes = 0;
  for (const [stem, labels] of seen) {
    if (labels.length > 1) {
      dupes++;
      console.log(`DUP x${labels.length}: "${stem.slice(0, 100)}"`);
      labels.forEach((l) => console.log(`    - ${l}`));
    }
  }
  console.log(dupes === 0 ? 'no duplicates' : `${dupes} duplicated stem(s)`);
}
