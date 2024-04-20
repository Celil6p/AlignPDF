import { usePdf } from "app/contexts/pdf-context";
import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { db } from "~/contexts/db"; // Adjust the import path as needed
import { Button } from "~/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { MergeOrderItem } from "~/contexts/types/pdf";

const MergeOrderList = () => {
  const { pdfFiles, mergeOrder, getFirstPage, updateMergeOrder } = usePdf();

  const [firstPageImages, setFirstPageImages] = useState<
    Record<number, string>
  >({});

  const [subPdfImages, setSubPdfImages] = useState<
    Record<number, [string, string]>
  >({});

  useEffect(() => {
    const fetchFirstPageImages = async () => {
      const images: Record<number, string> = {};

      for (const item of mergeOrder) {
        if (item.type === "pdf") {
          const pdf = pdfFiles.find((pdf) => pdf.id === item.pdfId);
          if (pdf) {
            // Check if the first page image exists in the database
            const storedImage = await db.firstPageImages.get(pdf.id as number);
            if (storedImage) {
              images[item.pdfId] = storedImage.imageUrl;
            } else {
              // Generate the first page image and store it in the database
              const imageUrl = await getFirstPage(pdf);
              await db.firstPageImages.add({
                pdfId: pdf.id,
                imageUrl,
              });
              images[item.pdfId] = imageUrl;
            }
          }
        }
      }

      setFirstPageImages(images);
    };
    fetchFirstPageImages();
  }, [mergeOrder, pdfFiles, getFirstPage]);

  useEffect(() => {
    const fetchSubPdfImages = async () => {
      const images: Record<number, [string, string]> = {};

      for (const item of mergeOrder) {
        if (item.type === "subPdf") {
          const storedImages = await db.subFileImages.get(item.pdfId);
          if (storedImages) {
            images[item.pdfId] = storedImages.imageUrls;
          }
        }
      }

      setSubPdfImages(images);
    };
    fetchSubPdfImages();
  }, [mergeOrder]);

  useEffect(() => {
    // Filter out items with unknown PDFs from the merge order
    const filteredMergeOrder = mergeOrder.filter((item) => {
      if (item.type === "pdf") {
        return pdfFiles.some((pdf) => pdf.id === item.pdfId);
      } else {
        return pdfFiles.some((pdf) =>
          pdf.subFiles.some((sub) => sub.id === item.pdfId)
        );
      }
    });

    // Update the merge order if it has changed
    if (filteredMergeOrder.length !== mergeOrder.length) {
      updateMergeOrder(filteredMergeOrder);
    }
  }, [mergeOrder, pdfFiles, updateMergeOrder]);

  const getFileName = (id: number, type: "pdf" | "subPdf") => {
    if (type === "pdf") {
      const file = pdfFiles.find((pdf) => pdf.id === id);
      return file ? file.title : "Unknown PDF";
    } else {
      let parentPdfTitle;
      const subFile = pdfFiles
        .flatMap((pdf) => pdf.subFiles)
        .find((sub) => sub.id === id);
      if (subFile !== undefined) {
        parentPdfTitle = pdfFiles.find(
          (pdf) => pdf.id === subFile.parentPdfId
        )?.title;
      } else {
        parentPdfTitle = "Unknown PDF";
      }
      return subFile
        ? `${parentPdfTitle} ${
            subFile.range[0] !== subFile.range[1]
              ? `pages ${subFile.range[0]} - ${subFile.range[1]}`
              : `page ${subFile.range[0]}`
          }`
        : "Unknown Sub-PDF";
    }
  };

  const pdfBgColors = [
    "bg-red-300",
    "bg-blue-300",
    "bg-yellow-300",
    "bg-green-300",
    "bg-purple-300",
    "bg-orange-300",
    "bg-indigo-300",
    "bg-pink-300",
    "bg-fushcia-300",
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
    "border-fushcia-700",
  ];

  const moveItemUp = (index: number) => {
    if (index > 0) {
      const updatedMergeOrder = [...mergeOrder];
      const temp = updatedMergeOrder[index];
      updatedMergeOrder[index] = updatedMergeOrder[index - 1];
      updatedMergeOrder[index - 1] = temp;
      updateMergeOrder(updatedMergeOrder);
    }
  };

  const moveItemDown = (index: number) => {
    if (index < mergeOrder.length - 1) {
      const updatedMergeOrder = [...mergeOrder];
      const temp = updatedMergeOrder[index];
      updatedMergeOrder[index] = updatedMergeOrder[index + 1];
      updatedMergeOrder[index + 1] = temp;
      updateMergeOrder(updatedMergeOrder);
    }
  };

  const getParentPdfId = (item: MergeOrderItem) => {
    if (item.type === "pdf") {
      return item.pdfId;
    } else {
      return item.parentPdfId || -1;
    }
  };

  return (
    <Card>
      <h2>Merge Order</h2>
      <ul className="flex flex-row justify-center items-center">
        {mergeOrder.map((item, index) => {
          const parentId = getParentPdfId(item);
          return(
          <li
            key={index}
            className={`${pdfBgColors[parentId as number % 8]} ${
              pdfBorderColors[parentId as number % 8]
            } border-2 rounded-md p-2 mb-2`}
          >
            <div className="flex items-center justify-between">
              <div className="truncate max-w-36">
                {getFileName(item.pdfId, item.type)} (
                {item.type === "pdf" ? "Full PDF" : "Split Pages"})
              </div>
              <TooltipProvider>
                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveItemUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move Up</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveItemDown(index)}
                        disabled={index === mergeOrder.length - 1}
                      >
                        <ArrowDown size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Move Down</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
            {item.type === "pdf" && firstPageImages[item.pdfId] && (
              <img
                src={firstPageImages[item.pdfId]}
                alt="First Page"
                className="mt-2 h-96 w-auto"
              />
            )}
            {item.type === "subPdf" && subPdfImages[item.pdfId] && (
              <div className="mt-2">
                {subPdfImages[item.pdfId][0] === subPdfImages[item.pdfId][1] ? (
                  <img className="h-96 w-auto" src={subPdfImages[item.pdfId][0]} alt="Page" />
                ) : (
                  <>
                    <img className="h-96 w-auto" src={subPdfImages[item.pdfId][0]} alt="First Page" />
                    <img className="h-96 w-auto" src={subPdfImages[item.pdfId][1]} alt="Last Page" />
                  </>
                )}
              </div>
            )}
          </li>
        )})}
      </ul>
    </Card>
  );
};

export default MergeOrderList;