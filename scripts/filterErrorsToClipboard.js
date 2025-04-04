
const fs = require('fs');
const readline = require('readline');

const input = process.stdin;
const rl = readline.createInterface({ input });

const errorLines = [];

rl.on('line', (line) => {
  if (line.includes('[ERROR]') || line.includes('Error:')) {
    errorLines.push(line);
  }
});

rl.on('close', () => {
  const output = errorLines.join('\n');
  console.log('\n=== Filtered Error Output ===\n');
  console.log(output);

  try {
    require('child_process').spawnSync('clip', { input: output });
    console.log('\n[✔] Error log copied to clipboard!');
  } catch (e) {
    console.warn('[!] Could not copy to clipboard. Please copy manually.');
  }
});
