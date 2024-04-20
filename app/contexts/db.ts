import Dexie from "dexie";
import { PdfFile, PdfSubFile, MergeOrderItem, FirstPageImage, SubFileImage } from "./types/pdf"; // Import your types

// Define interfaces for your database tables
interface PdfFileTable extends PdfFile {
  id?: number; // id is optional for new entries
}

interface PdfSubFileTable extends PdfSubFile {
  id?: number;
}


// Extend Dexie with your table types
class PdfDatabase extends Dexie {
  pdfFiles!: Dexie.Table<PdfFileTable, number>;
  subFiles!: Dexie.Table<PdfSubFileTable, number>;
  firstPageImages!: Dexie.Table<FirstPageImage, number>;
  subFileImages!: Dexie.Table<SubFileImage, number>; 
  mergeOrders!: Dexie.Table<MergeOrderItem, number>; // New table for merge order

  constructor() {
    super("PdfDatabase");
    this.version(1).stores({
      pdfFiles: "++id, title, file",
      subFiles: "++id, parentPdfId, range",
      firstPageImages: "pdfId, imageUrl",
      subFileImages: "subPdfId, parentPdfId, imageUrls",
      mergeOrders: "++id, type, pdfId, order, parentPdfId"
       // New table schema
    });
  }
}

export const db = new PdfDatabase();
