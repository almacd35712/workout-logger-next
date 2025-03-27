import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA';
const CLEAN_SHEET_NAME = 'March/April 2025';

export default async function handler(req, res) {
  const { day, exercise } = req.query;
  const credentials = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'lib', 'credentials.json'))
  );
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const sheetData = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${CLEAN_SHEET_NAME}!A:J`, // Adjust range if necessary
  });

  const rows = sheetData.data.values;

  let actualCol = rows[1].length - 1; // Find latest Actual column

  let currentSet = 1;
  let exerciseRow = rows.findIndex(r => r[1]?.trim().toLowerCase() === exercise.trim().toLowerCase());

  if (exerciseRow !== -1) {
    for (let i = exerciseRow; i < exerciseRow + 3; i++) {
      const cellContent = rows[i][actualCol];
      if (cellContent && cellContent.trim() !== '') {
        currentSet += 1;
      }
    }
  }

  res.status(200).json({ currentSet });
}
