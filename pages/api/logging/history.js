import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { getSheetConfig } from "../../../lib/utils/getSheetConfig";
import { getActualColumns, getExerciseRow, colToA1 } from "../../../lib/utils/sheetHelpers";

console.log("🔧 [DEBUG] Loaded: history.js");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { day, exercise } = req.query;
  if (!day || !exercise) {
    return res.status(400).json({ message: "Missing day or exercise" });
  }

  try {
    const config = getSheetConfig();
    const credsPath = path.join(process.cwd(), "lib", "credentials.json");
    const credentials = JSON.parse(fs.readFileSync(credsPath, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

    const sheetName = config.structuredTab;
    const range = `${sheetName}!A1:Z1000`;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range,
    });

    const rows = result.data.values || [];
    const exerciseRow = getExerciseRow(rows, day, exercise, config.layout.exerciseColumn);
    if (exerciseRow === -1) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    const header = rows[0] || [];
    const dataRow = rows[exerciseRow + 1] || [];

    const actualCols = getActualColumns(header, config.layout.actualStartColumn, config.layout.maxSets);

    const history = actualCols
      .map((colIndex, i) => {
        const set = dataRow[colIndex]?.trim();
        return set
          ? {
              set,
              col: header[colIndex] || `Actual ${i + 1}`,
            }
          : null;
      })
      .filter(Boolean)
      .slice(-3); // return last 3

    return res.status(200).json({ exercise, history });
  } catch (err) {
    console.error("❌ Error in history.js:", err);
    return res.status(500).json({ message: "Server error", details: err.message });
  }
}
