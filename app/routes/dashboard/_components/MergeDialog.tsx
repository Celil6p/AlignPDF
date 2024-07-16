import React, { useState, useEffect } from "react";
import { usePdf } from "app/contexts/pdf-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { db } from "~/contexts/db";

const MergeDialog: React.FC = () => {
  const { mergeOrder, pdfFiles, mergePdfs, getFirstPage } = usePdf();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [firstPageImage, setFirstPageImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const getDefaultMergedFileName = () => {
    if (mergeOrder.length === 0) return "merged.pdf";

    const firstItem = mergeOrder[0];
    let firstName = "";

    if (firstItem.type === "pdf") {
      firstName =
        pdfFiles.find((pdf) => pdf.id === firstItem.pdfId)?.title || "";
    } else {
      const subFile = pdfFiles
        .flatMap((pdf) => pdf.subFiles)
        .find((sub) => sub.id === firstItem.pdfId);
      if (subFile) {
        const parentPdf = pdfFiles.find(
          (pdf) => pdf.id === subFile.parentPdfId
        );
        firstName = parentPdf?.title || "";
      }
    }

    // Remove .pdf extension if it exists
    firstName = firstName.replace(/\.pdf$/i, "");

    return `AlignPDF-Merge_${firstName}.pdf`;
  };

  const [mergedPdfName, setMergedPdfName] = useState(
    getDefaultMergedFileName()
  );

  useEffect(() => {
    setMergedPdfName(getDefaultMergedFileName());
  }, [mergeOrder]);

  useEffect(() => {
    if (dialogOpen && mergeOrder.length > 0) {
      const fetchFirstPageImage = async () => {
        const firstItem = mergeOrder[0];
        if (firstItem.type === "pdf") {
          const pdf = pdfFiles.find((pdf) => pdf.id === firstItem.pdfId);
          if (pdf) {
            const storedImage = await db.firstPageImages.get(pdf.id as number);
            if (storedImage) {
              setFirstPageImage(storedImage.imageUrl);
            } else {
              const imageUrl = await getFirstPage(pdf);
              await db.firstPageImages.add({
                pdfId: pdf.id,
                imageUrl,
              });
              setFirstPageImage(imageUrl);
            }
          }
        } else if (firstItem.type === "subPdf") {
          const storedImages = await db.subFileImages.get(firstItem.pdfId);
          if (storedImages && storedImages.imageUrls.length > 0) {
            setFirstPageImage(storedImages.imageUrls[0]);
          }
        }
      };
      fetchFirstPageImage();
    }
  }, [dialogOpen, mergeOrder, pdfFiles, getFirstPage]);

  const handleMerge = () => {
    setDialogOpen(true);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const mergedBlob = await mergePdfs();
      if (mergedBlob) {
        const url = URL.createObjectURL(mergedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = mergedPdfName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error during PDF merge:", error);
    } finally {
      setIsDownloading(false);
      setDialogOpen(false);
    }
  };

  const getTotalPages = () => {
    return mergeOrder.reduce((total, item) => {
      if (item.type === "pdf") {
        const pdf = pdfFiles.find((p) => p.id === item.pdfId);
        return total + (pdf?.pages || 0);
      } else {
        const subFile = pdfFiles
          .flatMap((p) => p.subFiles)
          .find((s) => s.id === item.pdfId);
        return total + (subFile ? subFile.range[1] - subFile.range[0] + 1 : 0);
      }
    }, 0);
  };

  const totalPages = getTotalPages();

  const pdfBgColors = [
    "bg-red-300",
    "bg-blue-300",
    "bg-yellow-300",
    "bg-green-300",
    "bg-purple-300",
    "bg-orange-300",
    "bg-indigo-300",
    "bg-pink-300",
  ];

  const pdfBorderColors = [
    "border-red-700",
    "border-blue-700",
    "border-yellow-700",
    "border-green-700",
    "border-purple-700",
    "border-orange-700",
    "border-indigo-700",
    "border-pink-700",
  ];

  return (
    <>
      <Button onClick={handleMerge} disabled={mergeOrder.length === 0}>
        Merge
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Merge PDFs</DialogTitle>
            <DialogDescription>
              Preview and confirm your merge order
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {firstPageImage && (
              <div className="relative w-56 h-auto max-w-xs aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                <img
                  src={firstPageImage}
                  alt="First Page Preview"
                  className="absolute inset-0 w-full h-full object-cover border-4 rounded-lg"
                />
              </div>
            )}

            <div className="w-full text-center font-semibold">
              Total Pages: {totalPages}
            </div>

            <div className="w-full h-8 flex">
              {mergeOrder.map((item, index) => {
                const pdf = pdfFiles.find(
                  (p) =>
                    p.id ===
                    (item.type === "pdf" ? item.pdfId : item.parentPdfId)
                );
                const pages =
                  item.type === "pdf"
                    ? pdf?.pages || 0
                    : (pdf?.subFiles.find((s) => s.id === item.pdfId)
                        ?.range[1] ?? 0) -
                      (pdf?.subFiles.find((s) => s.id === item.pdfId)
                        ?.range[0] ?? 0) +
                      1;
                const width = (pages / totalPages) * 100;
                const colorIndex = (pdf?.id ?? 0) % 8;

                return (
                  <TooltipProvider key={`${item.pdfId}-${index}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-full ${pdfBgColors[colorIndex]} ${pdfBorderColors[colorIndex]} border-l border-r`}
                          style={{ width: `${width}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>PDF: {pdf?.title || "Unknown PDF"}</p>
                        <p>
                          Type: {item.type === "pdf" ? "Full PDF" : "Split PDF"}
                        </p>
                        {item.type === "subPdf" && (
                          <p>
                            Pages:{" "}
                            {pdf?.subFiles
                              .find((s) => s.id === item.pdfId)
                              ?.range.join("-")}
                          </p>
                        )}
                        <p>Total Pages: {pages}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            <Input
              type="text"
              value={mergedPdfName}
              onChange={(e) => setMergedPdfName(e.target.value)}
              placeholder="Enter merged PDF name"
            />

            {isDownloading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Merging PDFs...</span>
              </div>
            ) : (
              <Button onClick={handleDownload}>Download Merged PDF</Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MergeDialog;
