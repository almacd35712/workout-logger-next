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
  