import { google } from "googleapis";
import path from "path";
import fs from "fs/promises";

const SHEET_ID = "1cULmlrBSaJSPxTWH7pOcnpAY7B-tDkW8fN8AGaB-0uE";
const SHEET_NAME = "March/april 2025";

export default async function handler(req, res) {
  const { day } = req.query;

  console.log("➡️ Incoming request for exercises with day:", day);

  if (!day) {
    return res.status(400).json({ message: "Missing day parameter" });
  }

  try {
    const keyPath = path.join(process.cwd(), "lib", "credentials.json");
    const keyFile = await fs.readFile(keyPath, "utf8");
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const exercises = [];
    let isCorrectDay = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const currentDay = (row[0] || "").toLowerCase().trim();
      const rowExercise = (row[1] || "").trim();

      // Start extracting when day matches
      if (currentDay === day.toLowerCase()) {
        isCorrectDay = true;
        continue;
      }

      // Stop when a new day is reached
      if (isCorrectDay && currentDay.startsWith("day")) {
        break;
      }

      // Collect exercises under the matched day
      if (isCorrectDay && rowExercise) {
        const normalized = normalizeExerciseName(rowExercise);
        exercises.push(normalized);
      }
    }

    return res.status(200).json(exercises);
  } catch (error) {
    console.error("🔥 Error fetching exercises:", error);
    return res.status(500).json({ message: "Failed to fetch exercises" });
  }
}

// 🧠 Converts short/abbreviated names to clean names
function normalizeExerciseName(name) {
  const cleaned = name.trim().toLowerCase();

  const mappings = {
    "incline db bench": "Incline Dumbbell Bench Press",
    "incline db fly": "Incline Dumbbell Fly",
    "band fly": "Band Fly",
    "squat": "Barbell Back Squat",
    "sissy squat": "Sissy Squat",
    "rdl": "Romanian Deadlift",
    "leg curls": "Lying Leg Curl",
    "seated db ohp": "Seated Dumbbell Overhead Press",
    "cg bench": "Close Grip Bench Press",
    "band overhead ext": "Band Overhead Extension",
    "band tricep pushdown": "Band Tricep Pushdown",
    "db curls": "Dumbbell Bicep Curls",
    "band curls": "Band Bicep Curls",
    "band rear delt raise": "Band Rear Delt Raise",
    "db side delt raise": "Dumbbell Side Lateral Raise",
    "pullups": "Pull-Ups",
    "bent over barbell row": "Bent Over Barbell Row",
    "1 arm db row": "One-Arm Dumbbell Row",
    "1 arm cable row - high to low": "One-Arm Cable Row (High to Low)",
    "cable pullover": "Cable Pullover",
    "reverse hyperextention": "Reverse Hyperextension",
    "cable crunch": "Cable Crunch",
    "bench leg raise": "Bench Leg Raise",
    "dead bug": "Dead Bug",
    "seated dumbbell russian twist": "Seated Dumbbell Russian Twist"
  };

  return mappings[cleaned] || name; // fallback to original if not matched
}
