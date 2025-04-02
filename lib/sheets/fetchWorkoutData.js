import { google } from "googleapis";
import credentials from "@/lib/credentials.json";

export async function fetchWorkoutData(sheetName, range) {
  console.log("📥 fetchWorkoutData init", { sheetName, range });

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SHEET_ID || "1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  console.log("✅ fetchWorkoutData rows fetched");
  return res.data.values || [];
}
