export interface PdfSubFile {
  id?: number;
  parentPdfId: number;
  range: [number, number]; // start and end pages
}

export interface PdfFile {
  id?: number;
  file: File;
  title: string;
  size: number;
  pages: number;
  subFiles: PdfSubFile[];
}

export interface FirstPageImage {
  pdfId?: number; // Assuming the pdfId is of type number
  imageUrl: string;
}

export interface SubFileImage {
  subPdfId?: number; // Assuming the subpdfId is of type number
  parentPdfId?: number; // Assuming the parentPdfId is of type number
  imageUrls: [string,string];
}

export interface MergeOrderItem {
  id?: number;
  type: 'pdf' | 'subPdf'; // Discriminator between PDF and sub-PDF
  pdfId: number; // ID of the PDF or sub-PDF
  order: number; // Order in which the PDFs should be merged
}