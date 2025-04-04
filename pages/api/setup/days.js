// pages/api/setup/days.js
console.log("🔧 [DEBUG] Loaded: ../pages/api/setup/days.js");

export default function handler(req, res) {
  const days = [
    { label: "Chest", value: "Day 1" },
    { label: "Legs", value: "Day 2" },
    { label: "Delts + arms", value: "Day 3" },
    { label: "Back", value: "Day 4" },
  ];
  res.status(200).json(days);
}
