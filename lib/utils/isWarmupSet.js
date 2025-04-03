export function isWarmupSet(str) {
  if (typeof str !== 'string') return false;
  const lower = str.toLowerCase();
  return lower.includes("warm") || lower.startsWith("wu:");
}
