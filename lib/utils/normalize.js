export function normalize(str) {
  console.log("🔧 [DEBUG] Loaded: ../lib/utils/normalize.js");
  return str?.toLowerCase().replace(/\s+/g, "") || "";
}
