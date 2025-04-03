import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { getSheetConfig } from "../../../lib/utils/getSheetConfig";
import { getActualColumns, getExerciseRow } from "../../../lib/utils/sheetHelpers";
import { isWarmupSet } from "../../../lib/utils/isWarmupSet";

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
    const sheetId = config.spreadsheetId;
    const range = `${sheetName}!A1:Z1000`;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = result.data.values;
    const exerciseRow = getExerciseRow(rows, day, exercise, config.layout.exerciseColumn);
    if (exerciseRow === -1) {
      return res.status(404).json({ message: "Exercise not found." });
    }

    const header = rows[0] || [];
    const dataRow = rows[exerciseRow + 1] || [];
    const actualCols = getActualColumns(header, config.layout.actualStartColumn, config.layout.maxSets);

    let setCount = 0;
    let lastActual = "";
    let prescribed = "";
    let suggestedWeight = null;

    const targetActualCol = actualCols.find(i => !dataRow[i] || dataRow[i].trim() === "") || actualCols[actualCols.length - 1];

    for (let col of actualCols) {
      const val = dataRow[col]?.trim();
      if (val && col < targetActualCol) lastActual = val;
    }

    const prescribedCols = header.map((col, i) => ({
      i,
      label: col?.toLowerCase().trim(),
    })).filter(c => c.label?.includes("prescribed"));

    const matchedPrescribed = prescribedCols.filter(c => c.i < targetActualCol).sort((a, b) => b.i - a.i)[0];
    prescribed = matchedPrescribed ? dataRow[matchedPrescribed.i]?.trim() || "" : "";

    for (let i = exerciseRow + 1; i < rows.length; i++) {
      const val = rows[i]?.[targetActualCol]?.trim();
      if (val && !val.toLowerCase().includes("wu")) setCount++;
      else break; // stop at next block
    }

    if (lastActual) {
      const weight = parseFloat(lastActual);
      if (!isNaN(weight)) {
        suggestedWeight = (weight * 1.05).toFixed(1);
      }
    }

    // Warm-up scan
    const warmupSets = [];
    const warmupRow = exerciseRow + config.layout.warmupRowOffset;
    const warmupLine = rows[warmupRow]?.[targetActualCol] || "";

    const matches = [...warmupLine.matchAll(/(\d+)[xX](\d+)/g)];
    for (const match of matches) {
      warmupSets.push({ weight: match[1], reps: match[2] });
    }

    return res.status(200).json({
      setCount,
      lastActual,
      prescribed,
      suggestedWeight,
      warmupSets,
    });
  } catch (err) {
    console.error("❌ getsetcount error:", err);
    return res.status(500).json({ message: "Server error", details: err.message });
  }
}
