import Dexie from "dexie";
import { PdfFile, PdfSubFile } from "./types/pdf"; // Import your types

// Define interfaces for your database tables
interface PdfFileTable extends PdfFile {
  id?: number; // id is optional for new entries
}

interface PdfSubFileTable extends PdfSubFile {
  id?: number;
}

// New interface for first page images
interface FirstPageImage {
  pdfId?: number; // Assuming the pdfId is of type number
  imageUrl: string;
}

// Extend Dexie with your table types
class PdfDatabase extends Dexie {
  pdfFiles!: Dexie.Table<PdfFileTable, number>;
  subFiles!: Dexie.Table<PdfSubFileTable, number>;
  firstPageImages!: Dexie.Table<FirstPageImage, number>; // New table

  constructor() {
    super("PdfDatabase");
    this.version(1).stores({
      pdfFiles: "++id, title, file",
      subFiles: "++id, parentPdfId, range",
      firstPageImages: "pdfId, imageUrl" // New table schema
    });
  }
}

export const db = new PdfDatabase();
