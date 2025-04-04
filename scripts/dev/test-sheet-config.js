// scripts/dev/test-sheet-config.js
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { getSheetConfig } from "../../lib/utils/getSheetConfig.js";
console.log("🔧 [DEBUG] Loaded: ../scripts/dev/test-sheet-config.js");

async function main() {
  try {
    const config = getSheetConfig();
    console.log("🔧 Loaded Sheet Config:");
    console.log(JSON.stringify(config, null, 2));

    // Load credentials
    const keyPath = path.join(process.cwd(), "lib/credentials.json");
    const credentials = JSON.parse(fs.readFileSync(keyPath, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

    // Try reading 10 rows from the structured tab
    const range = `'${config.structuredTab}'!A1:J10`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range,
    });

    console.log("📋 Sample rows from structured tab:");
    console.table(response.data.values);
  } catch (err) {
    console.error("❌ Error testing sheet config:", err.message);
  }
}

main();
