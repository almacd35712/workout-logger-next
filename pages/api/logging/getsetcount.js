import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { getSheetData } from '../../../lib/sheets/getSheetData';
import { readFileSync } from 'fs';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA'; // ✅ Replace with your actual ID
const CLEAN_SHEET_NAME = 'March/april 2025'; // ✅ MUST match case from sheet tab exactly
const CREDENTIALS_PATH = path.join(process.cwd(), 'lib', 'keys', 'credentials.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const { day, exercise } = req.query;
  if (!day || !exercise) return res.status(400).json({ message: 'Missing day or exercise' });

  try {
    console.log('🔁 getsetcount API called with:');
    console.log('👉 Day:', day);
    console.log('👉 Exercise:', exercise);

    const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

    console.log(`📄 Fetching data from sheet: '${CLEAN_SHEET_NAME}'!A:Z`);
    const values = await getSheetData(sheets, SHEET_ID, CLEAN_SHEET_NAME);

    if (!values || values.length === 0) {
      throw new Error('❌ No data returned from sheet.');
    }

    console.log(`✅ Sheet loaded. Total rows: ${values.length}`);

    const dayLabels = {
      'Day 1': 'Chest',
      'Day 2': 'Legs',
      'Day 3': 'Delts + Arms',
      'Day 4': 'Back',
      Abs: 'Abs (Any Day)',
    };

    const targetLabel = dayLabels[day];
    console.log('🔍 Matching label for day:', targetLabel);

    const dayStartIndex = values.findIndex(row => row[1]?.trim() === targetLabel);
    if (dayStartIndex === -1) {
      throw new Error(`❌ Could not find day label "${targetLabel}" in column B`);
    }
    console.log(`📌 Found day section "${targetLabel}" at row ${dayStartIndex}`);

    const exerciseIndex = values.findIndex(
      (row, i) => i > dayStartIndex && row[1]?.trim() === exercise
    );
    if (exerciseIndex === -1) {
      console.warn(`⚠ Exercise "${exercise}" not found after "${targetLabel}"`);
      return res.status(200).json({
        setCount: 0,
        lastActual: '',
        prescribed: '',
        suggestedWeight: '',
        warmupSets: [],
      });
    }
    console.log(`🏋️ Found exercise "${exercise}" at row ${exerciseIndex}`);

    const headers = values[0] || [];
    const row = values[exerciseIndex];

    console.log("📎 Row values:", row); // Add this line for debugging

    const actualIndexes = headers
      .map((h, i) => (h?.startsWith('Actual') ? i : -1))
      .filter(i => i !== -1);

    const actualValues = actualIndexes.map(i => row[i]).filter(v => v?.trim());
    const setCount = actualValues.length;
    const lastActual = actualValues[actualValues.length - 1] || '';

    // Determine the prescribed value based on how many actual sets are already filled in
    let prescribed = '';

    // Try to find the *prescribed column that pairs with the last actual one*
    if (actualIndexes.length > 0) {
      const lastActualCol = actualIndexes[actualIndexes.length - 1];
      const possiblePrescribedCol = lastActualCol - 1;

      if (row[possiblePrescribedCol] && typeof row[possiblePrescribedCol] === 'string') {
        prescribed = row[possiblePrescribedCol].split('(')[0].replace(/\s+/g, '').trim();
      }
    }

    // Fallback to first available prescribed if needed
    if (!prescribed) {
      const prescribedIndexes = [4, 6, 8, 10];
      for (const i of prescribedIndexes) {
        if (row[i] && typeof row[i] === 'string' && row[i].trim()) {
          prescribed = row[i].split('(')[0].replace(/\s+/g, '').trim();
          break;
        }
      }
    }

    console.log('📌 Prescribed raw:', row[2]); // Add this line for debugging
    const suggestedWeight = ''; // Leave blank for now or add formula

    // Warm-Up Sets Logic
    const round = (value, toNearest = 5) => {
      return Math.round(value / toNearest) * toNearest;
    };
    
    const warmupSets = [];
    if (prescribed && /^\d+x\d+$/.test(prescribed)) {
      const [prescribedWeight, prescribedReps] = prescribed.split("x").map(Number);
    
      warmupSets.push({ weight: round(prescribedWeight * 0.5, 5), reps: 8 });
      warmupSets.push({ weight: round(prescribedWeight * 0.7, 5), reps: 5 });
      warmupSets.push({ weight: round(prescribedWeight * 0.85, 2.5), reps: 3 });
    }
    

    console.log(`📊 Found ${setCount} actual sets. Last value:`, lastActual);

    return res.status(200).json({
      setCount,
      lastActual,
      prescribed,
      suggestedWeight,
      warmupSets,
    });

  } catch (err) {
    console.error('❌ getsetcount error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
