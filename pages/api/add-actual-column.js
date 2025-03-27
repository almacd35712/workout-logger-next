import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA';
const SHEET_NAME = 'March/april 2025';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const keyPath = path.join(process.cwd(), 'lib', 'credentials.json');
    const keyFile = await fs.readFile(keyPath, 'utf8');
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:Z1`,
    });

    const header = data.values[0];
    const lastPrescribedIndex = header.map(h => h.toLowerCase()).lastIndexOf('prescribed');
    const nextCol = String.fromCharCode(65 + lastPrescribedIndex + 1);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${nextCol}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Actual']],
      },
    });

    return res.status(200).json({ message: 'New Actual column added!' });
  } catch (error) {
    console.error('Error adding actual column:', error);
    return res.status(500).json({ message: 'Failed to add column' });
  }
}
