// pages/api/test-exercises.js
import exerciseMap from '@/lib/exerciseMap';
const days = Object.keys(exerciseMap);

export default async function handler(req, res) {
  const { dryRun = 'true', verbose = 'false' } = req.query;
  const DRY_RUN = dryRun === 'true';
  const VERBOSE = verbose === 'true';

  const results = [];
  const errors = [];

  const isRealExercise = (name) => {
    const lower = name.toLowerCase();
    return !(
      /^(\d+)(x|×)\d+$/.test(name) ||              // e.g., 50x5, 135x5
      /rep max/.test(lower) ||                     // e.g., 15 rep max
      /^bwx\d+$/i.test(name) ||                    // e.g., BWx8
      /^\d{2,3}x\d+$/.test(name) ||                // e.g., 70x15
      /^\d+$/.test(name)                           // just numbers
    );
  };

  for (const day of days) {
    const exList = exerciseMap[day] || [];

    for (const exercise of exList) {
      if (!isRealExercise(exercise)) continue;

      const logEntry = {
        day,
        exercise,
        timestamp: new Date().toISOString(),
      };

      try {
        const countRes = await fetch(`http://localhost:3000/api/getsetcount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day, exercise }),
        });

        const countData = await countRes.json();

        if (!countRes.ok || countData?.error || countData?.message === 'No matching row found') {
          throw new Error(countData?.message || countData?.error || 'Unknown getsetcount error');
        }

        logEntry.setCount = countData?.count ?? 'N/A';

        if (!DRY_RUN) {
          const logRes = await fetch(`http://localhost:3000/api/logset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              day,
              exercise,
              weight: '10',
              reps: '10',
              notes: 'Dry run test set',
              dryRun: true,
            }),
          });

          const logData = await logRes.json();

          if (!logRes.ok || logData?.error) {
            throw new Error(logData?.error || 'Unknown logset error');
          }

          logEntry.logged = true;
        }

        results.push(logEntry);
      } catch (err) {
        const errorEntry = {
          ...logEntry,
          error: err.message,
        };
        errors.push(errorEntry);
        if (VERBOSE) results.push(errorEntry);
      }
    }
  }

  res.status(200).json({
    summary: {
      total: results.length + errors.length,
      passed: results.length,
      failed: errors.length,
    },
    results: VERBOSE ? results : undefined,
    errors,
  });
}
