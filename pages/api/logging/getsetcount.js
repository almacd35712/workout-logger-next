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

    console.log('🔁 getsetcount API called');
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
    if (dayStartIndex === -1) throw new Error(`Could not find day label "${targetLabel}" in column B`);

    let setCount = 0;
    for (let i = dayStartIndex + 1; i < values.length; i++) {
      const row = values[i];
      const cell = row[1]?.trim();

      if (!cell || Object.values(dayLabels).includes(cell)) break;
      if (cell === exercise) break;

      setCount++;
    }

    console.log(`📊 Sets before "${exercise}" on ${day}: ${setCount}`);
    res.status(200).json({ setCount });
  } catch (err) {
    console.error('❌ getsetcount error', err);
    res.status(500).json({ message: 'Error fetching set count', details: err.message });
  }
}
