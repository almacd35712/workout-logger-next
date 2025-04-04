import fs from 'fs';
import path from 'path';

export function logErrorToFile(errorText) {
  const logPath = path.resolve('logs/errors.log'); // Ensure consistent log file path
  fs.mkdirSync(path.dirname(logPath), { recursive: true }); // Create directory if it doesn't exist
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${errorText}\n`); // Append error with timestamp
}

try {
  // Some code that might throw an error
} catch (error) {
  logErrorToFile(error.message || 'Unknown error occurred');
}
