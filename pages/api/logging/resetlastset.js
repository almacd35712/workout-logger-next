import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { getSheetConfig } from "../../../lib/utils/getSheetConfig.js";

// Normalize helper
const normalize = (str) => str.trim().toLowerCase();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { day, exercise } = req.body;

  if (!day || !exercise) {
    return res.status(400).json({ error: "Missing day or exercise" });
  }

  try {
    const config = getSheetConfig();
    const { sheetId, title, layout } = config;

    const credentialsPath = path.join(process.cwd(), "lib/keys/credentials.json");
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

    // Pull all data
    const range = `${title}!A:Z`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) throw new Error("No rows in sheet");

    const dayLabel = normalize(day);
    const exerciseName = normalize(exercise);
    const exerciseCol = layout.exerciseColumn.charCodeAt(0) - 65;
    const startCol = layout.actualStartColumn.charCodeAt(0) - 65;

    // Locate the day row
    let dayRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (normalize(rows[i][0] || "") === dayLabel) {
        dayRowIndex = i;
        break;
      }
    }
    if (dayRowIndex === -1) throw new Error(`Day "${day}" not found`);

    // Locate the exercise row under the day
    let exerciseRowIndex = -1;
    for (let i = dayRowIndex + 1; i < rows.length; i++) {
      const firstCell = rows[i][0] || "";
      if (normalize(firstCell).startsWith("day")) break; // stop on next section
      const cell = rows[i][exerciseCol] || "";
      if (normalize(cell) === exerciseName) {
        exerciseRowIndex = i;
        break;
      }
    }
    if (exerciseRowIndex === -1) throw new Error("Exercise not found");

    // Find last non-empty cell in actual set columns
    let lastCol = -1;
    for (let i = startCol + layout.maxSets - 1; i >= startCol; i--) {
      const value = rows[exerciseRowIndex][i];
      if (value && value.trim() !== "") {
        lastCol = i;
        break;
      }
    }

    if (lastCol === -1) throw new Error("No set found to reset");

    const updateRange = `${title}!${String.fromCharCode(65 + lastCol)}${exerciseRowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: updateRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[""]],
      },
    });

    return res.status(200).json({ success: true, message: "Last set cleared." });
  } catch (err) {
    console.error("Reset error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
