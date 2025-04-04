export function isWarmupSet(str) {
  console.log("🔧 [DEBUG] Loaded: ../lib/utils/isWarmupSet.js");
  if (typeof str !== 'string') return false;
  const lower = str.toLowerCase();
  return lower.includes("warm") || lower.startsWith("wu:");
}
