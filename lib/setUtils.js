export function isWarmupSet(value) {
    return /^wu[:\-]/i.test(value) || value.toLowerCase().includes('warm');
  }
  