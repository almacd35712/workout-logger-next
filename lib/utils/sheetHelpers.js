// lib/utils/sheetHelpers.js

export function colToA1(colIndex) {
  console.log("🔧 [DEBUG] Loaded: ../lib/utils/sheetHelpers.js");
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
    let foundDay = false;
  
    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i][colIndex] || "";
      const norm = cell.toLowerCase().trim();
  
      if (norm.includes(dayLabel.toLowerCase())) {
        console.log(`🗓️ Matched Day: "${dayLabel}" at row ${i}`);
        foundDay = true;
      } else if (foundDay && norm.includes(exercise.toLowerCase())) {
        console.log(`🏋️ Matched Exercise: "${exercise}" at row ${i}`);
        return i;
      }
    }
  
    console.warn(`⚠️ Could not find "${exercise}" after day "${dayLabel}"`);
    return -1;
  }  
  
  export function getActualColumns(headerRow, startColLetter, maxCols) {
    const start = startColLetter.charCodeAt(0) - 65;
    return Array.from({ length: maxCols }, (_, i) => start + i);
  }
  
  export function resolveDayHeader(dayLabel) {
    const map = {
      "Day 1": "Chest",
      "Day 2": "Legs",
      "Day 3": "Delts + arms",
      "Day 4": "Back",
    };
    return map[dayLabel] || null;
  }
  