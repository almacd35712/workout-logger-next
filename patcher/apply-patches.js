import fs from "fs";
import path from "path";
import { patches } from "./patches.js";

const baseDir = path.resolve(process.cwd(), ".."); // go up to workout-logger-next root

patches.forEach(({ file, type, before, after }) => {
  const filePath = path.join(baseDir, file);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (type === "replace") {
    if (!content.includes(before)) {
      console.warn(`⚠️ BEFORE block not found in ${file}`);
      return;
    }

    const updated = content.replace(before, after);
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✅ Updated ${file}`);
  }
});
