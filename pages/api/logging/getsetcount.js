import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { getSheetData } from '../../../lib/sheets/getSheetData';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA';
const CLEAN_SHEET_NAME = 'March/april 2025';

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

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const values = await getSheetData(sheets, SHEET_ID, CLEAN_SHEET_NAME);

    const dayLabels = {
      'Day 1': 'Chest',
      'Day 2': 'Legs',
      'Day 3': 'Delts + Arms',
      'Day 4': 'Back',
      'Abs': 'Abs (Any Day)',
    };

    const targetLabel = dayLabels[day];
    const dayStartIndex = values.findIndex(row => row[1]?.trim() === targetLabel);
    if (dayStartIndex === -1) throw new Error(`Could not find day label "${targetLabel}"`);

    let setCount = 0;
    let exerciseRowIndex = -1;
    const warmupSets = [];

    // Count how many exercises before target one
    for (let i = dayStartIndex + 1; i < values.length; i++) {
      const row = values[i];
      const label = row[1]?.trim();

      if (!label || Object.values(dayLabels).includes(label)) break;
      if (label === exercise) {
        exerciseRowIndex = i;
        break;
      }

      if (label === 'Warm Up') {
        warmupSets.push(row[2]?.trim());
      } else {
        setCount++;
      }
    }

    if (exerciseRowIndex === -1) {
      return res.status(404).json({ message: `Exercise "${exercise}" not found in sheet` });
    }

    // Pull "prescribed" from Column C
    const prescribed = values[exerciseRowIndex][2] || "";

    // Get latest "Actual" column index
    const headerRow = values[0];
    const actualCols = headerRow
      .map((val, i) => val?.toLowerCase().includes("actual") ? i : -1)
      .filter(i => i >= 0);

    let lastActual = "";
    let suggestedWeight = null;

    for (let col of actualCols.reverse()) {
      const val = values[exerciseRowIndex][col];
      if (val) {
        lastActual = val;
        const parsed = parseFloat(val.replace(/[^0-9.]/g, ""));
        if (!isNaN(parsed)) {
          suggestedWeight = (parsed * 1.05).toFixed(1);
        }
        break;
      }
    }

    return res.status(200).json({
      setCount,
      lastActual,
      prescribed,
      suggestedWeight,
      warmupSets,
    });
  } catch (err) {
    console.error('❌ getsetcount error', err);
    res.status(500).json({ message: 'Error fetching set count', details: err.message });
  }
}
