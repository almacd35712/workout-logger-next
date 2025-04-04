import fs from 'fs';
import path from 'path';
console.log("🔧 [DEBUG] Loaded: apply-patches.js");

// Recursively get all .js files
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (stat.isFile() && file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Insert debug log after last import
function insertDebugLog(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');

  // Remove any old debug lines

  let inserted = false;

  // Case 1: Insert after last import
  let lastImport = -1;
  for (let i = 0; i < cleanedLines.length; i++) {
    if (cleanedLines[i].trim().startsWith('import ')) {
      lastImport = i;
    }
  }

  if (lastImport >= 0) {
    cleanedLines.splice(lastImport + 1, 0, debugLine);
    inserted = true;
  }

  // Case 2: Insert as first line inside exported function
  if (!inserted) {
    const exportFnIndex = cleanedLines.findIndex(line =>
      line.trim().match(/^export function\s+\w+\s*\(/)
    );

    if (exportFnIndex !== -1) {
      const openBraceIndex = cleanedLines
        .slice(exportFnIndex)
        .findIndex(line => line.includes('{'));

      if (openBraceIndex !== -1) {
        const insertAt = exportFnIndex + openBraceIndex + 1;
        cleanedLines.splice(insertAt, 0, '  ' + debugLine);
        inserted = true;
      }
    }
  }

  // Case 3: Fallback to top of file
  if (!inserted) {
    cleanedLines.unshift(debugLine);
  }

  fs.writeFileSync(file, cleanedLines.join('\n'), 'utf8');
  console.log(`✅ Updated ${relativePath}`);
}



// Run on all .js files in project root
function main() {
  const projectRoot = path.resolve(process.cwd(), '..'); // parent of patcher/
  const jsFiles = getAllJsFiles(projectRoot);
  jsFiles.forEach(insertDebugLog);
}

main();
