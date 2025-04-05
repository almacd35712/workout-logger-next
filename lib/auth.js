import { google } from "googleapis";
import { readFileSync } from "fs";
import path from "path";

// Define the required scopes
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Construct the path to the credentials file in /lib/keys
const CREDENTIALS_PATH = path.join(process.cwd(), "lib", "keys", "credentials.json");

// Read and parse credentials
const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH));

// Export named function that returns an authenticated Sheets client
export function getAuthSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return google.sheets({ version: "v4", auth });
}
