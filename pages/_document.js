import { Html, Head, Main, NextScript } from "next/document";
console.log("🔧 [DEBUG] Loaded: ../pages/_document.js");

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
