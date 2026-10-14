import { getListeningQuestions, getListeningSections } from "./listening-data";
import { getReadingPassages, getReadingQuestions } from "./reading-data";
import type { IeltsQuestion, ObjectiveModule } from "../types";

let cache: IeltsQuestion[] | null = null;

/** All 80 objective questions (Listening 1–40, Reading 41–80), built once. */
export function getAllQuestions(): IeltsQuestion[] {
  if (!cache) {
    cache = [...getListeningQuestions(), ...getReadingQuestions()];
  }
  return cache;
}

/** Questions of a single module (40 each). */
export function getModuleQuestions(module: ObjectiveModule): IeltsQuestion[] {
  return module === "listening" ? getListeningQuestions() : getReadingQuestions();
}

/** Questions grouped by listening section (1–4) or reading passage (1–3). */
export function getGroupQuestions(module: ObjectiveModule, group: number): IeltsQuestion[] {
  return getModuleQuestions(module).filter((q) => q.group === group);
}

export { getListeningSections, getReadingPassages };
