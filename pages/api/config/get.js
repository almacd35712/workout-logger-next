import { getSheetConfig } from "../../../lib/utils/getSheetConfig";

export default function handler(req, res) {
  const config = getSheetConfig();
  res.status(200).json({
    sheetId: config.sheetId || config.spreadsheetId,
    title: config.title,
  });
}
