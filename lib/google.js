import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';
console.log("🔧 [DEBUG] Loaded: ../lib/google.js");

const keyFilePath = path.join(process.cwd(), 'lib', 'credentials.json');
const credentials = JSON.parse(readFileSync(keyFilePath, 'utf8'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export { auth };
