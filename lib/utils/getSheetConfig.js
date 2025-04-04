import fs from "fs";
import path from "path";

export function getSheetConfig() {
  const configPath = path.join(process.cwd(), "lib/config/sheet-config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error("Missing sheet-config.json");
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  // Sanity fallback defaults
  config.layout = {
    exerciseColumn: config.layout?.exerciseColumn || "B",
    actualStartColumn: config.layout?.actualStartColumn || "F",
    maxSets: config.layout?.maxSets || 3,
    warmupRowOffset: config.layout?.warmupRowOffset ?? -1
  };

  return config;
}
