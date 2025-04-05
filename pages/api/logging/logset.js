import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { getSheetData } from '../../../lib/sheets/getSheetData';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA'; // replace with your actual sheet ID
const SHEET_NAME = 'March/april 2025'; // exact match to sheet tab
const CREDENTIALS_PATH = path.join(process.cwd(), 'lib', 'keys', 'credentials.json');

export function colToA1(colIndex) {
  let col = '';
  let n = colIndex;
  while (n >= 0) {
    col = String.fromCharCode((n % 26) + 65) + col;
    n = Math.floor(n / 26) - 1;
  }
  return col;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { day, exercise, weight, reps, notes, warmupSets = [], currentSetNumber } = req.body;

  if (!day || !exercise || !weight || !reps) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

    const values = await getSheetData(sheets, SHEET_ID, SHEET_NAME);
    const headers = values[0];
    const exerciseRowIndex = values.findIndex(row => row[1]?.trim() === exercise);
    if (exerciseRowIndex === -1) {
      return res.status(404).json({ message: 'Exercise not found in sheet' });
    }

    const actualCols = headers
      .map((h, i) => h?.toLowerCase().startsWith('actual') ? i : -1)
      .filter(i => i !== -1);

    const targetColIndex = actualCols.find(i => !values[exerciseRowIndex][i]);
    if (targetColIndex === undefined) {
      return res.status(409).json({ message: 'No empty Actual column available' });
    }

    const colLetter = colToA1(targetColIndex);
    const rowNumber = exerciseRowIndex + 1;

    // Log the main set
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${colLetter}${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { 
        values: [[`${weight}x${reps}${(notes && !notes.includes('WU:')) ? ' (' + notes + ')' : ''}`]] 
      },
    });

    console.log(`✅ Logged main set to ${colLetter}${rowNumber}`);

    // Check for warm-up row above
    const warmupRowIndex = exerciseRowIndex - 1;
    const warmupRow = values[warmupRowIndex];
    const isWarmupRow = warmupRow?.[1]?.toLowerCase() === 'warm up';

    if (currentSetNumber >= 3 && warmupSets.length > 0 && isWarmupRow) {
      const warmupString = "WU: " + warmupSets.map(s => `${s.weight}x${s.reps}`).join(', ');
      const warmupRowNumber = warmupRowIndex + 1;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!${colLetter}${warmupRowNumber}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[warmupString]] },
      });

      console.log(`🔥 Warm-ups logged to ${colLetter}${warmupRowNumber}`);
    }

    return res.status(200).json({ message: 'Set logged successfully' });

  } catch (err) {
    console.error('❌ Error logging set:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
