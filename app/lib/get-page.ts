import * as pdfjsLib from 'pdfjs-dist';

// Import the PdfFile type from your types file
import { PdfFile } from 'app/contexts/types/pdf';

/**
 * Get the first page of a PDF file as a data URL.
 * @param pdfFile The PDF file object.
 * @returns Promise that resolves to a string (data URL of the first page).
 */

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.1.392/pdf.worker.mjs';
export async function getPage(pdfFile: PdfFile, pageNumber: number): Promise<string> {
    try {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(pdfFile.file);

        return new Promise((resolve, reject) => {
            fileReader.onload = async (event) => {
                try {
                    if (event.target?.result instanceof ArrayBuffer) {
                        const typedArray = new Uint8Array(event.target.result);
                        const pdfDocument = await pdfjsLib.getDocument(typedArray).promise;
                        const firstPage = await pdfDocument.getPage(pageNumber);

                        const viewport = firstPage.getViewport({ scale: 1.5 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        if (context) {
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            await firstPage.render({ canvasContext: context, viewport: viewport }).promise;
                            resolve(canvas.toDataURL());
                        } else {
                            reject(new Error('Unable to get canvas context'));
                        }
                    } else {
                        reject(new Error('FileReader did not load an ArrayBuffer'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    } catch (error) {
        return Promise.reject(error);
    }
}
