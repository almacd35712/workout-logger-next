import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
console.log("🔧 [DEBUG] Loaded: ../lib/sheets.js");

export function getSheet() {
  const keyPath = path.join(process.cwd(), 'lib', 'credentials.json');
  const keyFile = fs.readFileSync(keyPath, 'utf8');
  const credentials = JSON.parse(keyFile);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}
