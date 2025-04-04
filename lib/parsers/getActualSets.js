export function getActualSets(values, exerciseRow, headerRow) {
  console.log("🔧 [DEBUG] Loaded: ../lib/parsers/getActualSets.js");
  const actualCols = headerRow
    .map((val, i) => val?.toLowerCase().includes("actual") ? i : -1)
    .filter(i => i >= 0);

  let setCount = 0;
  let lastActual = "";
  let lastWeight = null;

  for (let i = 0; i < actualCols.length; i++) {
    const colIndex = actualCols[i];
    const val = values[exerciseRow]?.[colIndex]?.trim();

    if (!val) {
      break; // Stop at first empty Actual cell — that's the next set
    }

    setCount++;
    lastActual = val;

    // Parse weight value (e.g., "70x8" => 70)
    const match = val.match(/(\d+(\.\d+)?)(?=x)/i);
    if (match) {
      lastWeight = parseFloat(match[1]);
    }
  }

  return { setCount, lastActual, lastWeight };
}
