import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Body, Head, Html, render, Tailwind, Text } from "react-email";

const version = (pkg: string): string =>
  JSON.parse(readFileSync(`node_modules/${pkg}/package.json`, "utf8")).version;

// Four boxes, each red inline and turned green by its own `sm:` rule.
// `sm:` compiles to `@media (min-width:40rem)`, which <Tailwind> cannot inline,
// so it goes into a <style> in <head>. At desktop width every box should be green.
const Email = () => (
  <Tailwind>
    <Html>
      <Head />
      <Body style={{ margin: 0, padding: "24px", backgroundColor: "#ffffff" }}>
        <Text style={{ fontFamily: "Arial, sans-serif", fontSize: "14px" }}>
          Each box is red inline and turns green through its own sm: media rule
          (min-width:40rem). At desktop width every box should be green.
        </Text>
        <div className="bg-[#cf222e] sm:bg-[#1a7f37] text-white p-[12px] mb-[8px]" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
          Box 1: green means its @media rule was kept
        </div>
        <div className="bg-[#cf222e] sm:bg-[#1f883d] text-white p-[12px] mb-[8px]" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
          Box 2: green means its @media rule was kept
        </div>
        <div className="bg-[#cf222e] sm:bg-[#2da44e] text-white p-[12px] mb-[8px]" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
          Box 3: green means its @media rule was kept
        </div>
        <div className="bg-[#cf222e] sm:bg-[#116329] text-white p-[12px] mb-[8px]" style={{ fontFamily: "Arial, sans-serif", fontSize: "16px" }}>
          Box 4: green means its @media rule was kept
        </div>
      </Body>
    </Html>
  </Tailwind>
);

const html = await render(<Email />);

// The only change: a space between adjacent closing braces inside <style>.
// This is the workaround documented in https://github.com/hteumeuleu/email-bugs/issues/92
const spaced = html.replace(
  /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
  (_, open: string, css: string, close: string) => open + css.replace(/\}(?=\})/g, "} ") + close,
);

const styleOf = (doc: string): string =>
  [...doc.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
const doubleBraces = (doc: string): number => styleOf(doc).match(/\}\}/g)?.length ?? 0;

mkdirSync("out", { recursive: true });
writeFileSync("out/raw.html", html);
writeFileSync("out/spaced.html", spaced);

console.log(`react-email:  ${version("react-email")}`);
console.log(`tailwindcss:  ${version("tailwindcss")}`);
console.log(`\nGenerated <style>:\n${styleOf(html)}`);
console.log(`\nout/raw.html     adjacent "}}" in <style>: ${doubleBraces(html)}  (Outlook.com keeps only the first @media block)`);
console.log(`out/spaced.html  adjacent "}}" in <style>: ${doubleBraces(spaced)}  (Outlook.com keeps all four)`);
