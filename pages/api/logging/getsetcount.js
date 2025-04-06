import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import { getSheetData } from '../../../lib/sheets/getSheetData';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA';
const SHEET_NAME = 'March/april 2025';
const CREDENTIALS_PATH = path.join(process.cwd(), 'lib', 'keys', 'credentials.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { day, exercise } = req.query;

  if (!day || !exercise) {
    return res.status(400).json({ message: 'Missing required query parameters' });
  }

  try {
    // ✅ Setup Google Sheets API Client
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

    // ✅ Fetch all rows
    const values = await getSheetData(sheets, SHEET_ID, SHEET_NAME);
    console.log(`📄 Loaded ${values.length} rows from sheet "${SHEET_NAME}"`);

    const dayRowIndex = values.findIndex(row => row[0]?.toLowerCase().includes(day.toLowerCase()));
    if (dayRowIndex === -1) {
      return res.status(404).json({ message: 'Day not found in sheet' });
    }

    console.log(`📌 Found day section "${day}" at row ${dayRowIndex + 1}`);

    const exerciseRowIndex = values.findIndex(
      (row, idx) => idx > dayRowIndex && row[1]?.trim() === exercise
    );

    if (exerciseRowIndex === -1) {
      return res.status(404).json({ message: 'Exercise not found under day section' });
    }

    const headers = values[0];
    const row = values[exerciseRowIndex];

    console.log(`🏋️ Found exercise "${exercise}" at row ${exerciseRowIndex + 1}`);
    console.log(`📎 Row values:`, row);

    // Get column indexes
    const actualCols = headers
      .map((h, i) => h?.toLowerCase().startsWith('actual') ? i : -1)
      .filter(i => i !== -1);

    const prescribedCols = headers
      .map((h, i) => h?.toLowerCase().startsWith('prescribed') ? i : -1)
      .filter(i => i !== -1);

    // Get values from specific columns - Change const to let
    let lastSetPerformed = row[actualCols[1]] || '';
    
    // Update prescribed value logic
    const selectedIndex = actualCols.find(i => !row[i]) ?? actualCols[actualCols.length - 1];
    const prescribedIndex = selectedIndex - 1;
    const prescribedValue = row[prescribedIndex] || '';

    // Get last set performed before current column
    const lastLoggedColIndex = actualCols
      .filter(i => i < selectedIndex && row[i])
      .pop(); // last filled actual column before selected

    // Now we can safely reassign
    lastSetPerformed = lastLoggedColIndex !== undefined ? row[lastLoggedColIndex] : 'Not Logged Yet';
    
    console.log(`📊 Last Set Performed (from col ${lastLoggedColIndex}): ${lastSetPerformed}`);

    // Updated logging
    console.log(`📌 selectedIndex: ${selectedIndex}`);
    console.log(`📌 Prescribed from col ${prescribedIndex}: ${prescribedValue}`);

    // Update logging before return
    console.log('📊 Response payload:', {
      prescribed: prescribedValue,
      lastSetPerformed,
      setCount: actualCols.length
    });

    return res.status(200).json({
      prescribed: prescribedValue,
      lastSetPerformed,
      setCount: actualCols.length
    });

  } catch (err) {
    console.error('❌ getsetcount error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
