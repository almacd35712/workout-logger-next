// lib/auth.js
import { google } from "googleapis";
import { readFileSync } from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = "lib/credentials.json"; // make sure this is accurate

const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

export { auth };
