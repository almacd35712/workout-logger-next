import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import { getSheetData } from '../../../lib/sheets/getSheetData';
import { findDayBlock } from '../../../lib/parsers/findDayBlock';
import { findExerciseRow } from '../../../lib/parsers/findExerciseRow';
import { isWarmupSet } from '../../../lib/utils/isWarmupSet';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA';
const SHEET_NAME = 'March/april 2025';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { day, exercise } = req.query;
  if (!day || !exercise) {
    return res.status(400).json({ message: 'Missing day or exercise' });
  }

  try {
    const keyPath = path.join(process.cwd(), 'lib', 'credentials.json');
    const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const values = await getSheetData(sheets, SHEET_ID, SHEET_NAME);
    console.log(`📄 Loaded ${values.length} rows from sheet "${SHEET_NAME}"`);

    const { start, end } = findDayBlock(values, day);
    if (start === -1 || end === -1) {
      return res.status(404).json({ message: `Could not locate block for day: ${day}` });
    }

    const exerciseRow = findExerciseRow(values, start, end, exercise);
    if (exerciseRow === -1) {
      return res.status(404).json({
        message: `Exercise "${exercise}" not found in sheet`,
        scannedRange: values.slice(start, end).map(r => r[1]).filter(Boolean),
      });
    }

    const headerRow = values[0];
    const dataRow = values[exerciseRow + 1] || [];

    const actualCols = [];
    const prescribedCols = [];

    headerRow.forEach((col, i) => {
      const norm = col?.toLowerCase()?.trim();
      if (norm?.includes('actual')) actualCols.push(i);
      if (norm?.includes('prescribed')) prescribedCols.push(i);
    });

    console.log("🧩 Header Row:", headerRow.join(', '));
    console.log("🔎 Actual column indexes:", actualCols);

    let targetActualCol = -1;
    let prescribed = '';
    let setCount = 0;
    let lastActual = '';
    let suggestedWeight = null;

    // 🧠 Find first empty actual col
    for (let col of actualCols) {
      const val = dataRow[col]?.trim();
      if (!val) {
        targetActualCol = col;
        break;
      }
    }

    // fallback to last col if all full
    if (targetActualCol === -1) {
      targetActualCol = actualCols[actualCols.length - 1];
    }

    console.log(`🎯 Next actual col index: ${targetActualCol}`);

    // 🔍 Scan earlier actual cols for lastActual
    for (let col of actualCols) {
      const val = dataRow[col]?.trim();
      if (val && col < targetActualCol) {
        lastActual = val;
      }
    }

    // 🔍 Find matching prescribed to left of target actual col
    const matchedPrescribed = prescribedCols
      .filter(i => i < targetActualCol)
      .sort((a, b) => b - a)[0];
    prescribed = matchedPrescribed !== undefined ? dataRow[matchedPrescribed]?.trim() || '' : '';

    // 🔢 Count entries in target actual col below this exercise
    for (let row = exerciseRow + 1; row < end; row++) {
      const val = values[row]?.[targetActualCol]?.trim();
      if (val && !val.toLowerCase().includes('wu')) {
        setCount++;
      }
    }

    // 💪 Suggest based on last actual
    if (lastActual) {
      const weight = parseFloat(lastActual);
      if (!isNaN(weight)) {
        suggestedWeight = (weight * 1.05).toFixed(1);
      }
    }

    // 🔥 Logging
    console.log(`✅ Counted ${setCount} sets in Actual col ${targetActualCol}`);
    console.log(`✅ Prescribed: ${prescribed}`);
    console.log(`✅ Last Actual: ${lastActual}`);
    console.log(`✅ Suggested Weight: ${suggestedWeight}`);

    // 🔥 Warmups
const warmupSets = [];
for (let i = exerciseRow - 1; i >= start; i--) {
  const label = values[i][0]?.trim();
  if (isWarmupSet(label)) {
    const weightCell = values[i][2]?.trim() || '';
    const repsCell = values[i][3]?.trim() || '';
    
    // Parse inline multi-warmups (e.g. "WU: 20x10, 30x6")
    const matches = [...(weightCell + ' ' + repsCell).matchAll(/(\d+)[xX](\d+)/g)];
    for (const match of matches) {
      warmupSets.push({ weight: match[1], reps: match[2] });
    }

    // stop scan if we hit a day title or section break
  } else if (/day\s+\d+/i.test(label) || label.toLowerCase().includes("warm")) {
    break;
  }
}
warmupSets.reverse(); // restore top-down order


    return res.status(200).json({
      setCount,
      lastActual,
      prescribed,
      warmupSets,
      suggestedWeight,
    });
  } catch (err) {
    console.error("❌ getsetcount error:", err);
    return res.status(500).json({ message: 'Server error', details: err.message });
  }
}
