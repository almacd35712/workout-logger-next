// pages/api/log.js

import { google } from 'googleapis';
import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { day, exercise, weight, reps, notes } = req.body;

  console.log('➡️ Incoming log request:', req.body);

  try {
    const keyPath = path.join(process.cwd(), 'lib', 'credentials.json');
    const keyFile = await fs.readFile(keyPath, 'utf8');
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1vm1azZlBQjsRNwX9TvF3reKa2ENPB9AKQ6FQXRQf-So';
    const sheetName = 'March/april 2025';

    const getSheet = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}`,
    });

    const rows = getSheet.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }

    const lowerDay = day.trim().toLowerCase();
    const lowerExercise = exercise.trim().toLowerCase();

    let matchRowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      const rowDay = rows[i][0]?.trim().toLowerCase();
      const rowExercise = rows[i][1]?.trim().toLowerCase();

      if (rowDay === lowerDay || (matchRowIndex !== -1 && rowDay === '')) {
        if (rowExercise === lowerExercise) {
          matchRowIndex = i;
          break;
        }
      }
    }

    if (matchRowIndex === -1) {
      return res.status(404).json({ message: 'No matching row found' });
    }

    const headerRow = rows[0];
    const actualColIndexes = [];

    for (let i = 0; i < headerRow.length; i++) {
      if (headerRow[i].toLowerCase().includes('actual')) {
        actualColIndexes.push(i);
      }
    }

    if (actualColIndexes.length === 0) {
      return res.status(400).json({ message: 'No Actual column found' });
    }

    const targetCol = actualColIndexes[actualColIndexes.length - 1];
    let insertRow = matchRowIndex + 1;

    while (insertRow < rows.length) {
      const nextExercise = rows[insertRow]?.[1]?.trim();
      const currentVal = rows[insertRow]?.[targetCol]?.trim();

      if (nextExercise) break;
      if (!currentVal) break;

      insertRow++;
    }

    const logString = `${weight}x${reps}${notes ? ` (${notes})` : ''}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${String.fromCharCode(65 + targetCol)}${insertRow + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[logString]],
      },
    });

    console.log(`✅ Logged set: ${logString} at row ${insertRow + 1}, column ${targetCol}`);
    return res.status(200).json({ message: 'Set logged successfully' });
  } catch (error) {
    console.error('🔥 Error logging set:', error);
    return res.status(500).json({ message: 'Failed to log set' });
  }
}
