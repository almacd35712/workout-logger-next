// lib/findSetCount.js
function normalize(str) {
    return (str || "").toString().toLowerCase().replace(/\s+/g, "").trim();
  }
  
  export function findSetCount(rows, selectedDay, selectedExercise) {
  console.log("🔧 [DEBUG] Loaded: ../lib/findsetcount.js");
    const normalizedDay = normalize(selectedDay);
    const normalizedExercise = normalize(selectedExercise);
  
    let insideDayBlock = false;
    let setCount = 0;
    let lastActual = "";
    let prescribed = "";
    let warmupSets = [];
  
    for (let i = 0; i < rows.length; i++) {
      const [a, b, c] = rows[i];
      const normA = normalize(a);
      const normB = normalize(b);
      const normC = normalize(c);
  
      // Day block detection
      if (normA.startsWith("day") && normA === normalizedDay) {
        insideDayBlock = true;
        continue;
      }
      if (insideDayBlock && normA.startsWith("day") && normA !== normalizedDay) {
        break; // Exited the block
      }
  
      if (!insideDayBlock) continue;
  
      // Exercise match
      if (
        normalize(b) === normalizedExercise ||
        normalize(c) === normalizedExercise
      ) {
        // Check up to 3 rows below for sets
        for (let j = 1; j <= 3; j++) {
          const setRow = rows[i + j];
          if (!setRow) continue;
          const setValue = setRow[2];
          if (!setValue) continue;
  
          const isWarmup = setValue.toLowerCase().includes("wu:");
          if (isWarmup) {
            const [_, raw] = setValue.split("WU:");
            const [weight, reps] = raw.split("x");
            warmupSets.push({ weight: weight?.trim(), reps: reps?.trim() });
          } else {
            if (!lastActual) lastActual = setValue;
            if (!prescribed && setRow[3]) prescribed = setRow[3];
            if (!setValue.includes("wu")) setCount++;
          }
        }
        break; // done after first match
      }
    }
  
    return {
      setCount,
      lastActual,
      prescribed,
      warmupSets,
    };
  }
  