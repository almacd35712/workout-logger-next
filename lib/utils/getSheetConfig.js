export function getSheetConfig() {
  return {
    spreadsheetId: "1kge0xQANIYQyy61Qeh2zsuETfnb0WjIUt3h33byskjA",
    title: "March/april 2025", // used in non-structured tabs
    structuredTab: "March/april 2025", // 🔥 make sure this is included
    layout: {
      exerciseColumn: "B",
      actualStartColumn: "F", // starting default
      prescribedStartColumn: "E", // 👈 Added this key
      maxSets: 3,
      warmupRowOffset: -1,
    },
  };
}
