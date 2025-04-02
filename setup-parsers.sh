#!/bin/bash

mkdir -p lib/parsers lib/utils lib/sheets

cat > lib/parsers/findDayBlock.js <<'EOF'
export function findDayBlock(rows, normalizedDay) {
  let dayStart = -1;
  let dayEnd = rows.length;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i][0];
    const value = raw?.toLowerCase().replace(/\s+/g, "");
    if (value?.startsWith("day") && value.includes(normalizedDay)) {
      dayStart = i;
      continue;
    }
    if (dayStart !== -1 && value?.startsWith("day")) {
      dayEnd = i;
      break;
    }
  }

  return { dayStart, dayEnd };
}
EOF

cat > lib/parsers/findExerciseRow.js <<'EOF'
import { normalize } from "../utils/normalize";

export function findExerciseRow(rows, start, end, target) {
  let matchedRow = -1;

  for (let i = start + 1; i < end; i++) {
    const b = normalize(rows[i]?.[1]);
    const c = normalize(rows[i]?.[2]);
    if (b === target || c === target) {
      matchedRow = i;
      break;
    }
  }

  return matchedRow;
}
EOF

cat > lib/parsers/getActualSets.js <<'EOF'
import { isWarmupSet } from "../utils/isWarmupSet";

export function getActualSets(rows, exerciseRow, headers) {
  const actualCols = headers
    .map((val, idx) => ({ val: val?.toLowerCase(), idx }))
    .filter((col) => col.val?.includes("actual"))
    .map((col) => col.idx);

  let setCount = 0;
  let lastActual = "";
  let lastWeight = null;

  for (const col of actualCols.reverse()) {
    for (let i = exerciseRow + 2; i >= exerciseRow; i--) {
      const cell = rows[i]?.[col];
      if (cell && !isWarmupSet(cell)) {
        setCount++;
        if (!lastActual) {
          lastActual = cell;
          const match = cell.match(/^([\d.]+)\s*x\s*\d+/);
          if (match) lastWeight = parseFloat(match[1]);
        }
      }
    }
    if (setCount >= 3) break;
  }

  return { setCount, lastActual, lastWeight };
}
EOF

cat > lib/utils/normalize.js <<'EOF'
export function normalize(str) {
  return str?.toLowerCase().replace(/\s+/g, "") || "";
}
EOF

cat > lib/utils/isWarmupSet.js <<'EOF'
export function isWarmupSet(str) {
  return str.toLowerCase().includes("warm") || str.toLowerCase().startsWith("wu:");
}
EOF

cat > lib/sheets/getSheetData.js <<'EOF'
import { google } from "googleapis";
import credentials from "@/lib/credentials.json";

export async function getSheetData(sheetName) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA";
  const range = `${sheetName}!A:Z`;

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return result.data.values || [];
}
EOF

echo "✅ Parsers and utils created successfully."
