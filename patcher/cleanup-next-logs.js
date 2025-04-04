import fs from 'fs';
import path from 'path';

function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (stat.isFile() && file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function shouldClean(file) {
  const normPath = file.replace(/\\/g, '/'); // normalize for Windows
  return (
    normPath.includes('/node_modules/next/') && // ✅ Target only `next/`
    !normPath.includes('/node_modules/nvm/') && // ❌ Skip if under `nvm`
    !normPath.includes('/node_modules/node/') && // ❌ Skip Node.js tools
    !normPath.includes('/node_modules/npm/') // ❌ Skip npm internal files
  );
}

function cleanDebugLogs(file) {
  if (!shouldClean(file)) return;

  const content = fs.readFileSync(file, 'utf8');
  const cleaned = content
    .split('\n')
    .filter(line => !line.includes('🔧 [DEBUG] Loaded:'))
    .join('\n');

  if (cleaned !== content) {
    fs.writeFileSync(file, cleaned, 'utf8');
    console.log(`🧹 Removed debug log from ${file}`);
  }
}

function main() {
  const root = path.resolve(process.cwd(), '..'); // project root
  const jsFiles = getAllJsFiles(root);
  jsFiles.forEach(cleanDebugLogs);
}

main();
