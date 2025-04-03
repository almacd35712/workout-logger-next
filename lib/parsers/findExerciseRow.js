import { normalize } from "../utils/normalize";

export function findExerciseRow(rows, start, end, target) {
  const normTarget = normalize(target);

  for (let i = start + 1; i < end; i++) {
    const b = normalize(rows[i]?.[1]);

    console.log("🔎 Checking row", i, { b, normTarget });

    if (b === normTarget) {
      return i;
    }
  }

  return -1;
}
