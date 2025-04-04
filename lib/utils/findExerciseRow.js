// lib/utils/findExerciseRow.js
import { google } from "googleapis";
import { getSheetConfig } from "./getSheetConfig.js";
import { dayLabelMap } from "./dayLabelMap.js";

export async function findExerciseRow(dayLabel, exerciseName) {
  const sheetConfig = getSheetConfig();

  const auth = new google.auth.GoogleAuth({
    keyFile: "lib/keys/credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const range = `${sheetConfig.title}!A1:Z100`;
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetConfig.sheetId,
    range,
  });

  const rows = data.values || [];

  // Sanitize input just in case
  if (Array.isArray(dayLabel)) {
    dayLabel = dayLabel[0] || "";
  }

  const sheetDay = (dayLabelMap[dayLabel] || dayLabel).toLowerCase?.().trim?.() || "";

  if (!sheetDay) {
    console.error(`❌ Invalid sheet day label derived from input:`, dayLabel);
    return -1;
  }

  console.log(`🧠 [DEBUG] Mapped day "${dayLabel}" to sheet day label "${sheetDay}"`);

  let foundDay = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const dayCell = (row[0] || "").toLowerCase().trim();
    const exCell = (row[1] || "").toLowerCase().trim();

    if (!foundDay && dayCell === sheetDay) {
      console.log(`🗓️ Found Day "${sheetDay}" at row ${i}`);
      foundDay = true;
      continue;
    }

    if (foundDay) {
      if (dayCell && dayCell !== sheetDay) break;
      if (exCell === exerciseName.toLowerCase().trim()) {
        console.log(`🏋️ Found Exercise "${exerciseName}" at row ${i}`);
        return i;
      }
    }
  }

  console.warn(`⚠️ Could not find "${exerciseName}" after day "${sheetDay}"`);
  return -1;
}
