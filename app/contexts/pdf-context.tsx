import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import placeholder from "public/placeholder-pdf-image.png";
import { PdfFile, MergeOrderItem } from "./types/pdf";
import { db } from "./db";
import { PDFDocument } from "pdf-lib";
import { getPage, revokeBlobUrl } from "~/lib/get-page";
import { useRef } from "react";
import { clearAppCache } from '../utils/cacheManager';

interface PdfProviderProps {
  children: React.ReactNode;
}

type PdfContextType = {
  mergeOrder: MergeOrderItem[];
  pdfFiles: PdfFile[];
  isLoading: boolean;
  addPdfFile: (file: File) => Promise<void>;
  createSubFile: (pdfId: number, range: [number, number]) => Promise<boolean>;
  mergePdfs: () => Promise<Blob | null>;
  removePdf: (pdfId: number) => Promise<void>;
  addPdfToMergeOrder: (type: "pdf" | "subPdf", pdfId: number) => Promise<void>;
  removeSubPdf: (subFileId: number, parentPdfId: number) => Promise<void>;
  getFirstPage: (pdf: PdfFile) => Promise<string>;
  updateMergeOrder: (newMergeOrder: MergeOrderItem[]) => Promise<void>;
  removeMergeOrder: (
    type: "pdf" | "subPdf",
    pdfId: number,
    order: number
  ) => Promise<void>;
  getCachedPage: (pdf: PdfFile, pageNumber: number) => Promise<string>;
  cleanupCache: () => void;
};

const PdfContext = createContext<PdfContextType | undefined>(undefined);
const MAX_CACHE_SIZE = 50; // Adjust based on your needs

export const usePdf = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error("usePdf must be used within a PdfProvider");
  }
  return context;
};

export const PdfProvider = ({ children }: PdfProviderProps) => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [mergeOrder, setMergeOrder] = useState<MergeOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pageCache = useRef<Map<string, string>>(new Map());


  useEffect(() => {
    const loadPdfFiles = async () => {
      setIsLoading(true);
      try {
        const allPdfFiles = await db.pdfFiles.toArray();
        setPdfFiles(allPdfFiles);
      } catch (error) {
        console.error("Error loading PDF files:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPdfFiles();
  }, []);

  const getCachedPage = useCallback(
    async (pdf: PdfFile, pageNumber: number): Promise<string> => {
      const cacheKey = `${pdf.id}-${pageNumber}`;
      if (pageCache.current.has(cacheKey)) {
        const cachedUrl = pageCache.current.get(cacheKey);
        if (cachedUrl) {
          return cachedUrl;
        }
      }
      if (pageCache.current.size >= MAX_CACHE_SIZE) {
        const oldestKey = pageCache.current.keys().next().value;
        const oldestUrl = pageCache.current.get(oldestKey);
        if (oldestUrl) {
          revokeBlobUrl(oldestUrl);
        }
        pageCache.current.delete(oldestKey);
      }
      const url = await getPage(pdf, pageNumber);
      pageCache.current.set(cacheKey, url);
      return url;
    },
    []
  );

  const cleanupCache = useCallback(() => {
    for (const url of pageCache.current.values()) {
      if (url) {
        revokeBlobUrl(url);
      }
    }
    pageCache.current.clear();
  }, []);

  // Add this effect for cleanup
  useEffect(() => {
    return () => {
      cleanupCache();
    };
  }, [cleanupCache]);

  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear all PDF files from the database
      await db.pdfFiles.clear();
      await db.subFiles.clear();
      await db.mergeOrders.clear();
      await db.firstPageImages.clear();
      await db.subFileImages.clear();

      // Clear the state
      setPdfFiles([]);
      setMergeOrder([]);

      // Clear the cache
      cleanupCache();

      // Clear app cache but retain specific cookies
      await clearAppCache(['analytics_id', 'user_preferences']);

      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cleanupCache]);

  const addPdfFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numberOfPages = pdfDoc.getPageCount();

      const newPdf = {
        title: file.name,
        file,
        size: file.size,
        pages: numberOfPages,
        subFiles: [],
      };

      const withId = await db.pdfFiles.add(newPdf);
      setPdfFiles((prev) => [...prev, { ...newPdf, id: withId }]);
    } catch (error) {
      console.error("Error processing the PDF file:", error);
      alert("Error processing the PDF file.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSubFile = useCallback(
    async (pdfId: number, range: [number, number]): Promise<boolean> => {
      setIsLoading(true);
      try {
        const pdfIndex = pdfFiles.findIndex((pdf) => pdf.id === pdfId);
        if (pdfIndex === -1) return false;

        const existingSubFile = pdfFiles[pdfIndex].subFiles?.find(
          (subFile) =>
            subFile.range[0] === range[0] && subFile.range[1] === range[1]
        );

        if (existingSubFile) return false;

        const newSubFile = { parentPdfId: pdfId, range };
        const subFileId = await db.subFiles.add(newSubFile);

        await db.transaction("rw", db.pdfFiles, db.subFiles, async () => {
          const updatedPdf = await db.pdfFiles.get(pdfId);
          if (updatedPdf) {
            if (!updatedPdf.subFiles) updatedPdf.subFiles = [];
            updatedPdf.subFiles.push({ ...newSubFile, id: subFileId });
            await db.pdfFiles.put(updatedPdf);
          }
        });

        setPdfFiles((prev) => {
          const newPdfFiles = [...prev];
          const updatedPdf = { ...newPdfFiles[pdfIndex] };
          if (!updatedPdf.subFiles) updatedPdf.subFiles = [];
          updatedPdf.subFiles.push({ ...newSubFile, id: subFileId });
          newPdfFiles[pdfIndex] = updatedPdf;
          return newPdfFiles;
        });

        return true;
      } catch (error) {
        console.error("Error creating sub file:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [pdfFiles]
  );

  const getFirstPage = useCallback(
    async (pdf: PdfFile): Promise<string> => {
      if (!pdf.id) {
        console.error("Error: PDF file is missing an ID.");
        return placeholder;
      }

      try {
        const storedImage = await db.firstPageImages.get(pdf.id);
        if (storedImage) return storedImage.imageUrl;

        const url = await getCachedPage(pdf, 1);
        await db.firstPageImages.put({ pdfId: pdf.id, imageUrl: url });
        return url;
      } catch (error) {
        console.error("Error fetching first page of PDF", error);
        return placeholder;
      }
    },
    [getCachedPage]
  );

  const mergePdfs = useCallback(async (): Promise<Blob | null> => {
    setIsLoading(true);
    try {
      const mergedPdfDoc = await PDFDocument.create();
      const mergeOrderItems = await db.mergeOrders.orderBy("order").toArray();

      for (const item of mergeOrderItems) {
        let pdfDoc;
        if (item.type === "pdf") {
          const pdfFile = await db.pdfFiles.get(item.pdfId);
          if (pdfFile && pdfFile.file instanceof File) {
            const arrayBuffer = await pdfFile.file.arrayBuffer();
            pdfDoc = await PDFDocument.load(arrayBuffer);
            const pagesToCopy = pdfDoc.getPageIndices();
            const pages = await mergedPdfDoc.copyPages(pdfDoc, pagesToCopy);
            pages.forEach((page) => mergedPdfDoc.addPage(page));
          }
        } else if (item.type === "subPdf") {
          const subFile = await db.subFiles.get(item.pdfId);
          if (subFile) {
            const parentPdfFile = await db.pdfFiles.get(subFile.parentPdfId);
            if (parentPdfFile && parentPdfFile.file instanceof File) {
              const arrayBuffer = await parentPdfFile.file.arrayBuffer();
              pdfDoc = await PDFDocument.load(arrayBuffer);
              const start = Math.max(subFile.range[0] - 1, 0);
              const end = Math.min(
                subFile.range[1] - 1,
                pdfDoc.getPageCount() - 1
              );
              const pagesToCopy = Array.from(
                { length: end - start + 1 },
                (_, i) => start + i
              );
              const pages = await mergedPdfDoc.copyPages(pdfDoc, pagesToCopy);
              pages.forEach((page) => mergedPdfDoc.addPage(page));
            }
          }
        }
        if (!pdfDoc) {
          console.error(`Failed to load PDF document for ID: ${item.pdfId}`);
        }
      }

      const mergedPdfBytes = await mergedPdfDoc.save();
      return new Blob([mergedPdfBytes], { type: "application/pdf" });
    } catch (error) {
      console.error("Error merging PDF files:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removePdf = useCallback(async (pdfId: number) => {
    setIsLoading(true);
    try {
      await db.transaction(
        "rw",
        db.pdfFiles,
        db.subFiles,
        db.mergeOrders,
        db.firstPageImages,
        db.subFileImages,
        async () => {
          const subFiles = await db.subFiles
            .where({ parentPdfId: pdfId })
            .toArray();
          const subFileIds = subFiles
            .map((subFile) => subFile.id)
            .filter((id): id is number => id !== undefined);
  
          await db.mergeOrders.where("pdfId").anyOf(subFileIds).delete();
          await db.mergeOrders.where({ type: "pdf", pdfId }).delete();
          await db.pdfFiles.delete(pdfId);
          await db.firstPageImages.where({ pdfId }).delete();
          await db.subFiles.where({ parentPdfId: pdfId }).delete();
          await db.subFileImages.where({ parentPdfId: pdfId }).delete();
  
          for (const [key, url] of pageCache.current.entries()) {
            if (key.startsWith(`${pdfId}-`)) {
              revokeBlobUrl(url);
              pageCache.current.delete(key);
            }
          }
  
          // Check if this was the last PDF
          const remainingPdfsCount = await db.pdfFiles.count();
          if (remainingPdfsCount === 0) {
            // This was the last PDF, clear all remaining data
            await clearAllData();
          }
        }
      );
  
      setPdfFiles((prevPdfFiles) => {
        const updatedPdfFiles = prevPdfFiles.filter((pdf) => pdf.id !== pdfId);
        if (updatedPdfFiles.length === 0) {
          // This was the last PDF in the state, trigger full cleanup
          clearAllData();
        }
        return updatedPdfFiles;
      });
  
    } catch (error) {
      console.error("Error removing PDF file:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clearAllData]);

  const removeSubPdf = useCallback(
    async (subFileId: number, parentPdfId: number) => {
      setIsLoading(true);
      try {
        await db.transaction(
          "rw",
          db.subFiles,
          db.mergeOrders,
          db.subFileImages,
          db.pdfFiles,
          async () => {
            await db.subFiles.delete(subFileId);
            await db.mergeOrders
              .where({ type: "subPdf", pdfId: subFileId })
              .delete();
            await db.subFileImages.delete(subFileId);

            const parentPdf = await db.pdfFiles.get(parentPdfId);
            if (parentPdf && parentPdf.subFiles) {
              const updatedSubFiles = parentPdf.subFiles.filter(
                (subFile) => subFile.id !== subFileId
              );
              await db.pdfFiles.update(parentPdfId, {
                subFiles: updatedSubFiles,
              });
            }
          }
        );

        setPdfFiles((prevPdfFiles) => {
          return prevPdfFiles.map((pdf) => {
            if (pdf.id === parentPdfId) {
              return {
                ...pdf,
                subFiles: pdf.subFiles?.filter(
                  (subFile) => subFile.id !== subFileId
                ),
              };
            }
            return pdf;
          });
        });
      } catch (error) {
        console.error("Error removing sub PDF file:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchAndUpdateMergeOrder = useCallback(async () => {
    try {
      const fetchedMergeOrder = await db.mergeOrders.orderBy("order").toArray();
      setMergeOrder(fetchedMergeOrder);
    } catch (error) {
      console.error("Error fetching merge order:", error);
    }
  }, []);

  useEffect(() => {
    fetchAndUpdateMergeOrder();
  }, [fetchAndUpdateMergeOrder]);

  const addPdfToMergeOrder = useCallback(
    async (type: "pdf" | "subPdf", pdfId: number) => {
      setIsLoading(true);
      try {
        const currentOrderCount = await db.mergeOrders.count();
        let newOrderItem: MergeOrderItem;

        if (type === "pdf") {
          newOrderItem = { type, pdfId, order: currentOrderCount };
        } else {
          const subFile = await db.subFiles.get(pdfId);
          if (!subFile) {
            throw new Error(`Subfile with ID ${pdfId} not found`);
          }
          newOrderItem = {
            type: "subPdf",
            pdfId,
            order: currentOrderCount,
            parentPdfId: subFile.parentPdfId,
          };
        }

        await db.mergeOrders.add(newOrderItem);
        await fetchAndUpdateMergeOrder();
      } catch (error) {
        console.error("Error adding to merge order:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAndUpdateMergeOrder]
  );

  const updateMergeOrder = useCallback(
    async (newMergeOrder: MergeOrderItem[]) => {
      setIsLoading(true);
      try {
        await db.transaction("rw", db.mergeOrders, async () => {
          await db.mergeOrders.clear();
          await db.mergeOrders.bulkAdd(newMergeOrder);
        });
        setMergeOrder(newMergeOrder);
      } catch (error) {
        console.error("Error updating merge order:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeMergeOrder = useCallback(
    async (type: "pdf" | "subPdf", pdfId: number, order: number) => {
      setIsLoading(true);
      try {
        await db.transaction("rw", db.mergeOrders, async () => {
          // Find and delete the specific merge order item
          const itemsToDelete = await db.mergeOrders
            .where({ type, pdfId, order })
            .toArray();

          if (itemsToDelete.length > 0) {
            await db.mergeOrders.bulkDelete(
              itemsToDelete.map((item) => item.id!)
            );
          } else {
            console.warn(
              `No matching ${type} found for pdfId: ${pdfId}, order: ${order}`
            );
            return; // Exit early if no item found
          }

          // Reorder remaining items
          const updatedMergeOrder = await db.mergeOrders.toArray();
          updatedMergeOrder.sort((a, b) => a.order - b.order);

          for (let i = 0; i < updatedMergeOrder.length; i++) {
            updatedMergeOrder[i].order = i;
            await db.mergeOrders.update(updatedMergeOrder[i].id!, { order: i });
          }

          setMergeOrder(updatedMergeOrder);
        });
      } catch (error) {
        console.error("Error removing from merge order:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      mergeOrder,
      pdfFiles,
      isLoading,
      addPdfFile,
      createSubFile,
      mergePdfs,
      removePdf,
      addPdfToMergeOrder,
      removeSubPdf,
      getFirstPage,
      updateMergeOrder,
      removeMergeOrder,
      getCachedPage,
      cleanupCache,
      clearAllData,
    }),
    [
      mergeOrder,
      pdfFiles,
      isLoading,
      addPdfFile,
      createSubFile,
      mergePdfs,
      removePdf,
      addPdfToMergeOrder,
      removeSubPdf,
      getFirstPage,
      updateMergeOrder,
      removeMergeOrder,
      getCachedPage,
      cleanupCache,
      clearAllData,
    ]
  );

  return (
    <PdfContext.Provider value={contextValue}>{children}</PdfContext.Provider>
  );
};
