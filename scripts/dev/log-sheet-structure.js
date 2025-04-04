// scripts/dev/log-sheet-structure.js

import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { getSheetConfig } from "../../lib/utils/getSheetConfig.js";
console.log("🔧 [DEBUG] Loaded: ../scripts/dev/log-sheet-structure.js");

async function main() {
  const config = getSheetConfig();

  const credsPath = path.join(process.cwd(), "lib/credentials.json");
  const credentials = JSON.parse(fs.readFileSync(credsPath, "utf8"));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

  const sheetName = config.structuredTab;
  const range = `${sheetName}!A1:Z1000`;

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range,
  });

  const rows = result.data.values || [];
  const colIndex = config.layout.exerciseColumn.charCodeAt(0) - 65;

  console.log(`📊 Scanning Sheet: "${sheetName}" (Exercise column = ${config.layout.exerciseColumn})`);

  console.log("\n🔎 Scanning raw values in column B (exercise column):");
  rows.forEach((row, i) => {
  const val = row[colIndex] || "";
  if (val.trim()) {
    console.log(`  [${i + 1}] "${val}"`);
  }
});

  let currentDay = "";
  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i][colIndex] || "";
    const norm = cell.toLowerCase().trim();

    if (norm.startsWith("day")) {
      currentDay = cell.trim();
      console.log(`\n📅 ${currentDay}`);
    } else if (norm.startsWith("warm up")) {
      console.log(`  🔸 Warm-up row at ${i + 1}`);
    } else if (currentDay && norm.length > 2) {
      const actuals = rows[i]?.slice(config.layout.actualStartColumn.charCodeAt(0) - 65, 26).filter(c => !!c);
      console.log(`  🏋️ ${cell.trim()}  (${actuals.length} set columns)`);
    }
  }
}

main().catch(err => {
  console.error("❌ Failed to analyze structure:", err.message);
});
