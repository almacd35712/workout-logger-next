export function isWarmupSet(str) {
  return str.toLowerCase().includes("warm") || str.toLowerCase().startsWith("wu:");
}
