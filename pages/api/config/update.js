import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "lib/config/sheet-config.json");

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { sheetId, title } = req.body;

  if (!sheetId || !title) {
    return res.status(400).json({ error: "Missing sheetId or title" });
  }

  try {
    const newConfig = {
      sheetId,
      title,
      layout: {
        exerciseColumn: "B",
        actualStartColumn: "F",
        maxSets: 3,
        warmupRowOffset: -1,
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), "utf8");
    res.status(200).json({ message: "✅ Config updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
