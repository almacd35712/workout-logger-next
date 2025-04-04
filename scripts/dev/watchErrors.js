// scripts/dev/watchErrors.js
import fs from "fs";
import path from "path";
import clipboard from "clipboardy";

const logFilePath = path.join(".next", "logs", "errors.log");

function ensureLogFileExists() {
  try {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, "", "utf-8");
    }
  } catch (err) {
    console.error("❌ Failed to ensure errors.log exists:", err);
  }
}

ensureLogFileExists();
console.log("👀 Watching for errors...");

fs.watch(path.dirname(logFilePath), (eventType, filename) => {
  if (filename === "errors.log") {
    ensureLogFileExists();
    try {
      const contents = fs.readFileSync(logFilePath, "utf-8").trim();
      if (contents) {
        console.log("📋 Copied error to clipboard:\n", contents);
        clipboard.writeSync(contents);
      }
    } catch (err) {
      console.warn("⚠️ Error reading errors.log:", err.message);
    }
  }
});
