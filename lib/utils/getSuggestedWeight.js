console.log("🔧 [DEBUG] Loaded: ../lib/utils/getSuggestedWeight.js");

export function getSuggestedWeight(lastWeight) {
  if (!lastWeight || isNaN(lastWeight)) return null;

  const weight = parseFloat(lastWeight);
  const suggested = weight * 1.025;

  // Round to nearest 5 lbs
  return Math.round(suggested / 5) * 5;
}
