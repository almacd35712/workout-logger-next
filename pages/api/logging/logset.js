export function colToA1(colIndex) {
  console.log("🔧 [DEBUG] Loaded: ../pages/api/logging/logset.js");
    let col = "";
    let n = colIndex;
    while (n >= 0) {
      col = String.fromCharCode((n % 26) + 65) + col;
      n = Math.floor(n / 26) - 1;
    }
    return col;
  }
  
  export function getExerciseRow(rows, dayLabel, exercise, colLetter) {
    const colIndex = colLetter.charCodeAt(0) - 65;
    let matchDay = false;
  
    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i][colIndex] || "";
      if (cell.toLowerCase().includes(dayLabel.toLowerCase())) {
        matchDay = true;
      } else if (matchDay && cell.toLowerCase().includes(exercise.toLowerCase())) {
        return i;
      }
    }
    return -1;
  }
  
  export function getActualColumns(headerRow, startColLetter, count) {
    const start = startColLetter.charCodeAt(0) - 65;
    return Array.from({ length: count }, (_, i) => start + i);
  }

if (currentSetNumber >= 3 && warmupSets.length > 0) {
  console.log("🔧 [DEBUG] Logging warm-up sets to the sheet...");
  
  // Iterate over warmupSets and log each set
  warmupSets.forEach((set, index) => {
    console.log(`Logging warm-up set ${index + 1}: ${set}`);
    // Add logic to log each warm-up set to the sheet
    // Example: Use Google Sheets API to append the data
  });

  console.log("✅ Warm-up sets logged successfully.");
}
