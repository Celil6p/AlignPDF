import * as pdfjsLib from "pdfjs-dist";
import { PdfFile } from "app/contexts/types/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export async function getPage(
  pdfFile: PdfFile,
  pageNumber: number
): Promise<string> {
  let pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    const arrayBuffer = await pdfFile.file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);
    pdfDocument = await pdfjsLib.getDocument(typedArray).promise;
    const page = await pdfDocument.getPage(pageNumber);

    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to get canvas context");
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL();
  } catch (error) {
    console.error("Error processing PDF page:", error);
    throw error;
  } finally {
    if (pdfDocument) {
      await pdfDocument.destroy();
    }
    if (canvas) {
      canvas.width = canvas.height = 0;
      canvas = null;
    }
  }
}

export function revokeBlobUrl(url: string | undefined) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
