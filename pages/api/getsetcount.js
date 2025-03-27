import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA';
const SHEET_NAME = 'March/april 2025';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { day, exercise } = req.query;
  console.log('➡️ Incoming request:', { day, exercise });

  try {
    const keyPath = path.join(process.cwd(), 'lib', 'credentials.json');
    const keyFile = await fs.readFile(keyPath, 'utf8');
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:Z100`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    const headerRow = rows[0];
    const actualColIndex = headerRow.map(h => h.toLowerCase()).lastIndexOf('actual');

    if (actualColIndex === -1) {
      return res.status(200).json({ setCount: 0, showAddColumn: true });
    }

    let currentDay = '';
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // ✅ Only update currentDay if column A is not "warm up" or empty
      const colA = (row[0] || '').toLowerCase().trim();
      if (colA && colA !== 'warm up') {
        currentDay = colA;
      }

      const rowExercise = (row[1] || '').toLowerCase().trim();

      console.log(`🔍 Row ${i}: currentDay="${currentDay}", rowExercise="${rowExercise}"`);

      if (
        currentDay === day.toLowerCase().trim() &&
        rowExercise === exercise.toLowerCase().trim()
      ) {
        let count = 0;
        for (let j = i; j < i + 3; j++) {
          if (rows[j] && rows[j][actualColIndex]?.trim()) {
            count++;
          }
        }

        return res.status(200).json({
          setCount: count,
          showAddColumn: false,
        });
      }
    }

    console.error('❌ No matching row found for:', { day, exercise });
    return res.status(404).json({ message: 'No matching row found' });
  } catch (error) {
    console.error('🔥 Error fetching set count:', error);
    return res.status(500).json({ message: 'Failed to get set count' });
  }
}
