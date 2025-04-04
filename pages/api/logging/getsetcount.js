"use strict";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { getSheetConfig } from "../../../lib/utils/getSheetConfig.js";

// Utility: Normalize strings (trim and lowercase)
const normalize = (str) => str.trim().toLowerCase();

/**
 * API Route handler for getsetcount.
 * Expects query parameters: day & exercise.
 */
export default async function handler(req, res) {
  try {
    const { day, exercise } = req.query;
    if (!day || !exercise) {
      return res.status(400).json({ error: "Missing day or exercise parameter" });
    }

    const result = await getSetCount(day, exercise);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getsetcount:", err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * getSetCount: Loads the Google Sheet data and returns:
 * - setCount: number of actual sets logged
 * - lastActual: value of the last logged set
 * - prescribed: (placeholder) prescribed weight info
 * - suggestedWeight: (placeholder) suggested weight info
 * - warmupSets: an array of warm-up set strings (parsed from warm-up row)
 *
 * The function uses the layout info from sheet-config.json.
 */
export async function getSetCount(day, exercise) {
  // Load configuration from sheet-config.json
  const config = getSheetConfig();
  const spreadsheetId = config.sheetId; // Updated to use config.sheetId
  const sheetName = config.structuredTab;

  // Debugging: Log the spreadsheet ID and sheet name
  console.log("📄 [DEBUG] Spreadsheet ID:", spreadsheetId);
  console.log("📄 [DEBUG] Sheet Name:", sheetName);

  if (!spreadsheetId) {
    throw new Error("Missing required parameter: spreadsheetId");
  }

  // Load Google Sheets API credentials
  const credentialsPath = path.join(process.cwd(), "lib/keys/credentials.json");
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth: await auth.getClient(),
  });

  // Fetch all data from the structured tab
  const range = `'${sheetName}'`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error("No data found in the sheet.");
  }

  console.log(`Found ${rows.length} rows in sheet "${sheetName}".`);

  // Normalize input day and exercise for matching
  const targetDay = normalize(day);
  const targetExercise = normalize(exercise);

  // Find the row index where the day header appears (assumes day is in the first column)
  let dayRowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i][0] || "";
    if (normalize(cell).includes(targetDay)) {
      dayRowIndex = i;
      console.log(`Day "${day}" found at row ${i + 1} (cell: "${cell}").`);
      break;
    }
  }
  if (dayRowIndex === -1) {
    throw new Error(`Could not find day "${day}" in the sheet.`);
  }

  // Determine the column index where exercises are listed
  const exerciseColIndex = config.layout.exerciseColumn.charCodeAt(0) - 65;

  // Search for the exercise row within the current day section.
  // We assume that once a new day header is encountered, the current section ends.
  let exerciseRowIndex = -1;
  for (let i = dayRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    // Check if a new day header appears (assuming headers start with "day")
    const firstCell = row[0] || "";
    if (firstCell && normalize(firstCell).startsWith("day")) {
      console.log(`Reached new day section at row ${i + 1}.`);
      break;
    }
    const cellValue = row[exerciseColIndex] || "";
    if (normalize(cellValue) === targetExercise) {
      exerciseRowIndex = i;
      console.log(`Exercise "${exercise}" found at row ${i + 1} (cell: "${cellValue}").`);
      break;
    }
  }
  if (exerciseRowIndex === -1) {
    throw new Error(`Could not locate exercise "${exercise}" under day "${day}".`);
  }

  // Calculate the number of working sets logged.
  // Using the actual set columns starting from the configured column.
  const startColIndex = config.layout.actualStartColumn.charCodeAt(0) - 65;
  const maxSets = config.layout.maxSets || 3;
  let setCount = 0;
  let lastActual = "";
  for (let i = startColIndex; i < startColIndex + maxSets; i++) {
    const cell = rows[exerciseRowIndex][i] || "";
    if (cell.trim() !== "") {
      setCount++;
      lastActual = cell;
    }
  }

  // Warm-up sets: located at the row offset specified in config (typically above the exercise row)
  let warmupSets = [];
  const warmupRowIndex = exerciseRowIndex + config.layout.warmupRowOffset;
  if (warmupRowIndex >= 0 && rows[warmupRowIndex]) {
    const warmupCell = rows[warmupRowIndex][startColIndex] || "";
    if (warmupCell.startsWith("WU:")) {
      const warmupStr = warmupCell.replace("WU:", "").trim();
      // Parse the warm-up sets into an array (e.g., ["30x10", "40x6", "55x3"])
      warmupSets = warmupStr.split(",").map((s) => s.trim());
    }
  }

  // Placeholders for additional metadata—update with your logic if needed.
  const prescribed = "";
  const suggestedWeight = null;

  return { setCount, lastActual, prescribed, suggestedWeight, warmupSets };
}

export function getSheetConfig() {
  return {
    spreadsheetId: "1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA", // Replace with your actual spreadsheet ID
    title: "March/april 2025",
    layout: {
      exerciseColumn: "B",
      actualStartColumn: "F",
      maxSets: 3,
      warmupRowOffset: -1,
    },
  };
}
