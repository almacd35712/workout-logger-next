import { google } from 'googleapis';

/**
 * Fetches all values from a given sheet tab (e.g. 'March/april 2025').
 * Expects the sheetName to be passed in without surrounding quotes.
 * Automatically wraps sheet name in quotes for safety.
 *
 * @param {google.sheets_v4.Sheets} sheets - Authenticated Sheets client
 * @param {string} spreadsheetId - ID of the spreadsheet
 * @param {string} sheetName - Tab name (e.g., 'March/april 2025')
 * @returns {Promise<string[][]>} - 2D array of sheet values
 */
export async function getSheetData(sheets, spreadsheetId, sheetName) {
  const range = `'${sheetName}'!A:Z`; // Quotes required if name contains special characters
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = result.data.values || [];
    console.log(`📄 Loaded ${values.length} rows from sheet "${sheetName}"`);
    return values;
  } catch (error) {
    console.error(`❌ Failed to fetch data from "${sheetName}"`, error);
    throw new Error(`Sheet access error: ${error.message}`);
  }
}
