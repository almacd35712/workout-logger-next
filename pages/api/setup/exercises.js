// pages/api/setup/exercises.js
import { getExercisesForDay } from "../../../lib/utils/getExercisesForDay.js";

console.log("🔧 [DEBUG] Loaded: ../pages/api/setup/exercises.js");

export default async function handler(req, res) {
  const { day } = req.query;

  if (!day || typeof day !== "string") {
    return res.status(400).json({ error: "Invalid or missing day" });
  }

  try {
    const exercises = await getExercisesForDay(day);
    console.log("📋 [DEBUG] Exercises returned:", exercises);

    res.status(200).json(exercises);
  } catch (err) {
    console.error("❌ [ERROR] Failed to fetch exercises:", err);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
}
