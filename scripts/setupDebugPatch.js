// scripts/setupDebugPatch.js
const SUPPRESSED_PATTERNS = [
    "[DEBUG] Loaded: ../node_modules/",
    "[DEBUG] Loaded: ../../node_modules/",
    "[DEBUG] Loaded: ./node_modules/"
  ];
  
  function shouldSuppress(message) {
    return SUPPRESSED_PATTERNS.some((pattern) => message.includes(pattern));
  }
  
  function wrapConsoleMethod(methodName) {
    const original = console[methodName];
    console[methodName] = (...args) => {
      const message = args.join(" ");
      if (shouldSuppress(message)) return;
      original(...args);
    };
  }
  
  // Patch multiple methods
  ["debug", "log", "info"].forEach(wrapConsoleMethod);
  