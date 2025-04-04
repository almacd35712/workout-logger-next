// pages/api/logging/getsetcount.js
import { findExerciseRow } from "@/lib/utils/findExerciseRow";
import { getSheetConfig } from "@/lib/utils/getSheetConfig";
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const { day, exercise } = req.query;
    console.log("🐾 [CHECKPOINT] Received query:", { day, exercise });

    const rowIndex = await findExerciseRow(day, exercise);
    if (typeof rowIndex !== "number" || rowIndex < 0) {
      console.warn(`⚠️ Could not locate row for exercise: ${exercise} on day: ${day}`);
      return res.status(404).json({ error: "Exercise row not found." });
    }

    const sheetConfig = getSheetConfig();

    const auth = new google.auth.GoogleAuth({
      keyFile: "lib/keys/credentials.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const fullRowRange = `${sheetConfig.title}!A${rowIndex + 1}:Z${rowIndex + 1}`;
    const { data: rowData } = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetConfig.sheetId,
      range: fullRowRange,
    });

    const row = rowData.values?.[0] || [];
    const actualStartIndex = columnLetterToIndex(sheetConfig.layout.actualStartColumn);
    const actuals = row.slice(actualStartIndex, actualStartIndex + sheetConfig.layout.maxSets).filter(Boolean);

    const warmupRow = rowIndex + sheetConfig.layout.warmupRowOffset;
    const { data: warmupData } = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetConfig.sheetId,
      range: `${sheetConfig.title}!A${warmupRow + 1}:Z${warmupRow + 1}`,
    });

    const warmupRowVals = warmupData.values?.[0] || [];
    const warmupSets = warmupRowVals
      .slice(actualStartIndex, actualStartIndex + sheetConfig.layout.maxSets)
      .map((val) => {
        const [weight, reps] = val.split("x").map((s) => s.trim());
        return { weight, reps };
      })
      .filter((s) => s.weight && s.reps);

    res.status(200).json({
      setCount: actuals.length,
      lastActual: actuals[actuals.length - 1] || "",
      prescribed: row[actualStartIndex - 1] || "",
      suggestedWeight: row[actualStartIndex + sheetConfig.layout.maxSets] || null,
      warmupSets,
    });
  } catch (err) {
    console.error("💥 [ERROR] Failed in getsetcount:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

function columnLetterToIndex(letter) {
  return letter.toUpperCase().charCodeAt(0) - 65;
}
