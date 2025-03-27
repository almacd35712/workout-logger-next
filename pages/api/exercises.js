import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SHEET_ID = '1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA';
const CLEAN_SHEET_NAME = 'March/April 2025';

const dayLabels = {
  'Day 1': 'Chest',
  'Day 2': 'Legs',
  'Day 3': 'Delts + Arms',
  'Day 4': 'Back',
  'Abs': 'Abs (Any Day)',
};

function cleanExerciseName(raw) {
  const name = raw.trim();

  if (!name || name.toLowerCase() === 'warm up') return null;

  // Keep 'Band' exercises as-is
  if (name.toLowerCase().startsWith('band')) {
    return name
      .replace(/\bdb\b/i, 'Dumbbell')
      .replace(/\bohp\b/i, 'Overhead Press')
      .replace(/\bext\b/i, 'Extension');
  }

  return name
    .replace(/\bdb\b/i, 'Dumbbell')
    .replace(/\bohp\b/i, 'Overhead Press')
    .replace(/\bcg\b/i, 'Close Grip')
    .replace(/\brdl\b/i, 'Romanian Deadlift')
    .replace(/\brow\b/i, 'Row')
    .replace(/\bext\b/i, 'Extension')
    .replace(/\bpress\b/i, 'Press')
    .replace(/\bfly\b/i, 'Fly')
    .replace(/\btricep\b/i, 'Triceps')
    .replace(/\bcurl\b/i, 'Curl')
    .replace(/\boverhead\b/i, 'Overhead')
    .replace(/\brear delt\b/i, 'Rear Delt')
    .replace(/\bside delt\b/i, 'Side Delt')
    .replace(/\bleg\b/i, 'Leg')
    .replace(/\bsquat\b/i, 'Squat')
    .replace(/\bpullover\b/i, 'Pullover')
    .replace(/\bpullups\b/i, 'Pullups')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
}

export default async function handler(req, res) {
  const { day } = req.query;
  if (!day || !dayLabels[day]) {
    return res.status(400).json({ error: 'Invalid or missing day' });
  }

  try {
    const keyPath = path.join(process.cwd(), 'lib', 'credentials.json');
    const keyFile = fs.readFileSync(keyPath, 'utf8');
    const credentials = JSON.parse(keyFile);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${CLEAN_SHEET_NAME}'!B:B`,
    });

    const rows = response.data.values.map(r => r[0]?.trim() || '');
    const label = dayLabels[day];
    const startIndex = rows.findIndex(r => r.toLowerCase() === label.toLowerCase());

    if (startIndex === -1) return res.status(404).json({ error: 'Day not found' });

    let exercises = [];
    for (let i = startIndex + 1; i < rows.length; i++) {
      const value = rows[i]?.trim();
      if (!value || Object.values(dayLabels).includes(value)) break;

      const cleaned = cleanExerciseName(value);
      if (cleaned && !exercises.includes(cleaned)) {
        exercises.push(cleaned);
      }
    }

    return res.status(200).json(exercises);
  } catch (err) {
    console.error('Exercise API error:', err);
    return res.status(500).json({ error: 'Failed to fetch exercises' });
  }
}
