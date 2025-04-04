export function isWarmupSet(value) {
  console.log("🔧 [DEBUG] Loaded: ../lib/setUtils.js");
    return /^wu[:\-]/i.test(value) || value.toLowerCase().includes('warm');
  }
  