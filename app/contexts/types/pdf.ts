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
