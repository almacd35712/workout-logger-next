import { normalize } from "../utils/normalize";

export function findExerciseRow(rows, start, end, target) {
  let matchedRow = -1;

  for (let i = start + 1; i < end; i++) {
    const b = normalize(rows[i]?.[1]);
    const c = normalize(rows[i]?.[2]);
    if (b === target || c === target) {
      matchedRow = i;
      break;
    }
  }

  return matchedRow;
}
