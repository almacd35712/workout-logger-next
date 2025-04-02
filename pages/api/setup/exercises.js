import exerciseMap from '@/lib/exerciseMap';

export default function handler(req, res) {
  const { day } = req.query;

  if (!day || !exerciseMap[day]) {
    console.warn("❌ Invalid or missing day:", day);
    return res.status(400).json([]);
  }

  const exercises = exerciseMap[day] || [];
  const options = exercises.map((ex) => ({
    label: ex,
    value: ex
  }));

  console.log(`🎯 Final exercises for ${day}:`, options);
  res.status(200).json(options);
}
