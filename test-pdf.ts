import * as pdfjsLib from 'pdfjs-dist';
import fs from 'fs';

async function test() {
  const data = new Uint8Array(fs.readFileSync('test.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const hasXFA = pdf.hasXFA;
  console.log('hasXFA:', hasXFA);
  if (hasXFA) {
    const xfa = await pdf.getXFA();
    console.log('XFA:', JSON.stringify(xfa).substring(0, 500));
  }
}
test().catch(console.error);
