// lib/utils/findExerciseRow.js
import { google } from "googleapis";
import { getSheetConfig } from "./getSheetConfig.js";
import { dayLabelMap } from "./dayLabelMap.js";

export async function findExerciseRow(dayLabel, exerciseName) {
  const sheetDay = (dayLabelMap[dayLabel] || dayLabel).toLowerCase();
  console.log(`🧠 [DEBUG] Mapped day "${dayLabel}" to sheet day label "${sheetDay}"`);

  const config = getSheetConfig();

  const auth = new google.auth.GoogleAuth({
    keyFile: "lib/keys/credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: `${config.title}!A1:Z100`,
  });

  const rows = data.values || [];
  let foundDay = false;

  for (let i = 0; i < rows.length; i++) {
    const dayCell = (rows[i][0] || "").toLowerCase().trim();
    const exCell = (rows[i][1] || "").toLowerCase().trim();

    if (!foundDay && dayCell === sheetDay) {
      console.log(`🗓️ Found Day "${sheetDay}" at row ${i}`);
      foundDay = true;
      continue;
    }

    if (foundDay && exCell === exerciseName.toLowerCase()) {
      console.log(`✅ Found exercise "${exerciseName}" at row ${i}`);
      return i;
    }

    if (foundDay && dayCell.includes("day")) break;
  }

  console.warn(`⚠️ Could not find exercise "${exerciseName}" under day "${sheetDay}"`);
  return -1;
}
