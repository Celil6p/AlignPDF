import * as pdfjsLib from 'pdfjs-dist';
import { PdfFile } from 'app/contexts/types/pdf';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

/**
 * Get a specific page of a PDF file as a data URL.
 * @param pdfFile The PDF file object.
 * @param pageNumber The page number to render (1-based index).
 * @returns Promise that resolves to a string (data URL of the specified page).
 */
export function getPage(pdfFile: PdfFile, pageNumber: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = async (event) => {
            try {
                if (!(event.target?.result instanceof ArrayBuffer)) {
                    throw new Error('FileReader did not load an ArrayBuffer');
                }

                const typedArray = new Uint8Array(event.target.result);
                const pdfDocument = await pdfjsLib.getDocument(typedArray).promise;
                const page = await pdfDocument.getPage(pageNumber);

                const scale = 1.5;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) {
                    throw new Error('Unable to get canvas context');
                }

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
                resolve(canvas.toDataURL());
            } catch (error) {
                reject(error);
            }
        };

        fileReader.onerror = (error) => reject(error);

        fileReader.readAsArrayBuffer(pdfFile.file);
    });
}