// scripts/dev/watchErrorsFromStderr.js
import { spawn } from 'child_process';
import clipboard from 'clipboardy';

const dev = spawn('npm', ['run', 'dev'], { shell: true });

dev.stderr.on('data', (data) => {
  const str = data.toString();
  console.error(str);

  // Heuristically detect an error (very basic filter)
  if (str.includes('Error') || str.includes('⨯')) {
    clipboard.writeSync(str);
    console.log('📋 Copied error to clipboard');
  }
});

dev.stdout.on('data', (data) => {
  process.stdout.write(data);
});
