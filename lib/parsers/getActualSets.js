import { isWarmupSet } from "../utils/isWarmupSet";

export function getActualSets(rows, exerciseRow, headers) {
  const actualCols = headers
    .map((val, idx) => ({ val: val?.toLowerCase(), idx }))
    .filter((col) => col.val?.includes("actual"))
    .map((col) => col.idx);

  let setCount = 0;
  let lastActual = "";
  let lastWeight = null;

  for (const col of actualCols.reverse()) {
    for (let i = exerciseRow + 2; i >= exerciseRow; i--) {
      const cell = rows[i]?.[col];
      if (cell && !isWarmupSet(cell)) {
        setCount++;
        if (!lastActual) {
          lastActual = cell;
          const match = cell.match(/^([\d.]+)\s*x\s*\d+/);
          if (match) lastWeight = parseFloat(match[1]);
        }
      }
    }
    if (setCount >= 3) break;
  }

  return { setCount, lastActual, lastWeight };
}
