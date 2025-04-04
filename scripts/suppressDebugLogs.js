// scripts/suppressDebugLogs.js
const suppressPattern = /\[DEBUG\] Loaded:/;

// Patch both stdout and stderr
function patchWrite(stream) {
  const originalWrite = stream.write;
  stream.write = function (chunk, ...args) {
    const str = chunk?.toString?.();
    if (str && suppressPattern.test(str)) {
      return true; // suppress
    }
    return originalWrite.call(stream, chunk, ...args);
  };
}

patchWrite(process.stdout);
patchWrite(process.stderr);
