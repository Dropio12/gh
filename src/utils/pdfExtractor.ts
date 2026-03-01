import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdf.js using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export async function extractXFAFromPdf(base64Data: string): Promise<string | null> {
  try {
    // Convert base64 to Uint8Array
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    if (pdf.hasXFA) {
      const xfaData = await pdf.getXFA();
      if (xfaData) {
        // xfaData is usually an object with keys representing different XML streams
        // We can stringify it or extract the specific XML parts
        return JSON.stringify(xfaData);
      }
    }
    
    return null; // Not an XFA PDF
  } catch (error) {
    console.error("Error extracting XFA from PDF:", error);
    return null;
  }
}
