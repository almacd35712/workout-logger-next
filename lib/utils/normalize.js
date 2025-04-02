export function normalize(str) {
  return str?.toLowerCase().replace(/\s+/g, "") || "";
}
