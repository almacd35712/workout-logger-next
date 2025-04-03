import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { getSheetConfig } from "../../../lib/utils/getSheetConfig";
import { colToA1 } from "../../../lib/utils/sheetHelpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const config = getSheetConfig();
    const credsPath = path.join(process.cwd(), "lib/credentials.json");
    const credentials = JSON.parse(fs.readFileSync(credsPath, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

    const sheetName = config.structuredTab;
    const sheetId = config.spreadsheetId;

    // Load header row
    const headerRange = `${sheetName}!A1:Z1`;
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: headerRange,
    });

    const header = headerRes.data.values?.[0] || [];
    const actualStartIndex = config.layout.actualStartColumn.charCodeAt(0) - 65;
    let actualCols = header.slice(actualStartIndex).filter(col => col?.toLowerCase().startsWith("actual"));

    const nextColIndex = actualStartIndex + actualCols.length;
    const nextLabel = `Actual ${actualCols.length + 1}`;

    const updateRange = `${sheetName}!${colToA1(nextColIndex)}1`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextLabel]],
      },
    });

    return res.status(200).json({
      message: `✅ Added new column: ${nextLabel} at ${updateRange}`,
    });
  } catch (err) {
    console.error("❌ Error in addactualcolumn.js:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
}
