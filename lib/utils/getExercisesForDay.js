// lib/utils/getExercisesForDay.js
import { google } from "googleapis";
import { getSheetConfig } from "./getSheetConfig.js";

export async function getExercisesForDay(dayName) {
  const config = getSheetConfig();

  const auth = new google.auth.GoogleAuth({
    keyFile: "lib/keys/credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const range = `${config.title}!A1:Z100`;
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range,
  });

  const rows = data.values || [];
  const exercises = [];

  let foundDay = false;
  const dayLabel = dayName.toLowerCase();

  console.log("🔍 [DEBUG] Scanning for day:", dayLabel);

  for (const [i, row] of rows.entries()) {
    const dayCol = (row[0] || "").toLowerCase().trim();
    const exerciseCol = (row[1] || "").trim();

    if (!foundDay && dayCol === dayLabel) {
      console.log(`✅ Found "${dayName}" at row ${i}`);
      foundDay = true;
      continue;
    }

    if (foundDay) {
      if ((row[0] || "").toLowerCase().includes("day")) {
        console.log(`⛔ Reached new day section at row ${i}`);
        break;
      }

      if (exerciseCol) {
        exercises.push({
          label: exerciseCol,
          value: exerciseCol,
        });
        console.log(`➕ Added exercise: ${exerciseCol}`);
      }
    }
  }

  console.log("📋 [RESULT] Exercises returned:", exercises);
  return exercises;
}
