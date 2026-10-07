import fs from "node:fs/promises";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const pdfPath = process.argv[2];
const outPath = process.argv[3];

if (!pdfPath || !outPath) {
  console.error("Usage: node scripts/extract-pdf-text.mjs <pdf> <out.txt>");
  process.exit(1);
}

const data = new Uint8Array(await fs.readFile(pdfPath));
const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise;
const pages = [];

for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const text = content.items
    .map((item) => ("str" in item ? item.str : ""))
    .filter(Boolean)
    .join("\n");
  pages.push(`--- PAGE ${pageNumber} ---\n${text}`);
}

await fs.writeFile(outPath, pages.join("\n\n"), "utf8");
console.log(`Extracted ${pdf.numPages} pages to ${outPath}`);
