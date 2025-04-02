export function findDayBlock(rows, targetDay) {
    console.log("🔍 findDayBlock start", { targetDay });
  
    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "");
    const normalizedDay = normalize(targetDay);
    let start = -1;
    let end = rows.length;
  
    for (let i = 0; i < rows.length; i++) {
      const val = normalize(rows[i]?.[0] || "");
      if (val.startsWith("day") && val.includes(normalizedDay)) {
        start = i;
        console.log(`✅ Day block start found at row ${i}`);
      } else if (start !== -1 && val.startsWith("day")) {
        end = i;
        console.log(`⛔ Day block ends at row ${i}`);
        break;
      }
    }
  
    if (start === -1) throw new Error("Day block not found");
    return { start, end };
  }
  