import fs from "fs";
import path from "path";
console.log("🔧 [DEBUG] Loaded: ../lib/utils/getSheetConfig.js");

// ❌ Removed this redundant declaration
export function getSheetConfig() {
  return {
    spreadsheetId: "1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA",
    title: "March/april 2025",
    layout: {
      exerciseColumn: "B",
      actualStartColumn: "F",
      maxSets: 3,
      warmupRowOffset: -1,
    },
  };
}

import { getSheetConfig } from "../../utils/getSheetConfig.js";
