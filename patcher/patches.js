console.log("🔧 [DEBUG] Loaded: patches.js");
export const patches = [
  {
    file: "scripts/dev/log-sheet-structure.js",
    type: "replace",
    before: `const rows = result.data.values || [];
const colIndex = config.layout.exerciseColumn.charCodeAt(0) - 65;`,
    after: `const rows = result.data.values || [];
const colIndex = config.layout.exerciseColumn.charCodeAt(0) - 65;

console.log("\\n🔎 Scanning raw values in column B (exercise column):");
rows.forEach((row, i) => {
  const val = row[colIndex] || "";
  if (val.trim()) {
    console.log(\`  [\${i + 1}] "\${val}"\`);
  }
});`,
  }
];
