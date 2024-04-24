import { usePdf } from "app/contexts/pdf-context";
import { useEffect, useState } from "react";
import { Card } from "~/components/ui/card";
import { db } from "~/contexts/db"; // Adjust the import path as needed
import { Button } from "~/components/ui/button";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { MergeOrderItem } from "~/contexts/types/pdf";

const MergeOrderList = () => {
  const {
    pdfFiles,
    mergeOrder,
    getFirstPage,
    updateMergeOrder,
    removeMergeOrder,
    mergePdfs,
  } = usePdf();

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

  async function handleMerge() {
    try {
      const mergedBlob = await mergePdfs();
      if (mergedBlob) {
        const url = URL.createObjectURL(mergedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "merged.pdf"; // Name of the downloaded file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up to release memory
      }
    } catch (error) {
      console.error("Error during PDF merge:", error);
      // Handle the error appropriately
    }
  }

  const getFileName = (id: number, type: "pdf" | "subPdf") => {
    if (type === "pdf") {
      const file = pdfFiles.find((pdf) => pdf.id === id);
      return file ? file.title : "Unknown PDF";
    } else {
      const subFile = pdfFiles
        .flatMap((pdf) => pdf.subFiles)
        .find((sub) => sub.id === id);
      if (subFile !== undefined) {
        const parentPdfTitle = pdfFiles.find(
          (pdf) => pdf.id === subFile.parentPdfId
        )?.title;
        return parentPdfTitle || "Unknown PDF";
      }
      return "Unknown Sub-PDF";
    }
  };

  const getPageNumberAndType = (id: number, type: "pdf" | "subPdf") => {
    if (type === "pdf") {
      return "Full PDF";
    } else {
      const subFile = pdfFiles
        .flatMap((pdf) => pdf.subFiles)
        .find((sub) => sub.id === id);
      if (subFile !== undefined) {
        return subFile.range[0] !== subFile.range[1]
          ? `Pages ${subFile.range[0]} - ${subFile.range[1]}`
          : `Page ${subFile.range[0]}`;
      }
      return "Unknown Sub-PDF";
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
    <>
      {mergeOrder.length !== 0 ? (
        <>
          <Card className="p-4 border w-full h-full mx-10 my-2 flex flex-col items-center">
            <h2>Merge Order</h2>
            <ul className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center items-center gap-4 mt-4 min-w-56 border-none transition-all">
              {mergeOrder.map((item, index) => {
                const parentId = getParentPdfId(item);
                return (
                  <li
                    key={index}
                    className={`${pdfBgColors[(parentId as number) % 8]}
                      rounded-md p-4 mb-2 shadow-md h-[380px]`}
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm">
                          {getFileName(item.pdfId, item.type)}
                        </p>
                      </div>
                      <div className="flex justify-center items-center">
                        {item.type === "pdf" && firstPageImages[item.pdfId] && (
                          <div className="relative">
                            <TooltipProvider>
                              <div className="absolute opacity-80 sm:opacity-0 flex space-x-2 justify-center items-center w-full h-full bg-opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-90 hover:opacity-100">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-black border"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => moveItemUp(index)}
                                      disabled={index === 0}
                                    >
                                      <ArrowLeft size={20} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Up order</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-white border"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        removeMergeOrder(
                                          item.type,
                                          item.pdfId,
                                          item.order
                                        )
                                      }
                                    >
                                      <Trash2 size={20} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Remove from order
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-black border"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => moveItemDown(index)}
                                      disabled={index === mergeOrder.length - 1}
                                    >
                                      <ArrowRight size={20} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Down order</TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                            <img
                              src={firstPageImages[item.pdfId]}
                              alt="First Page"
                              className={`h-auto w-auto object-contain max-w-48 max-h-64 border-4 ${
                                pdfBorderColors[(item.pdfId as number) % 8]
                              } rounded-lg shadow-lg`}
                            />
                          </div>
                        )}
                        {item.type === "subPdf" && subPdfImages[item.pdfId] && (
                          <div className="relative">
                            <TooltipProvider>
                              <div className="absolute z-10 opacity-80 sm:opacity-0 flex space-x-2 justify-center items-center w-full h-full bg-opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-90 hover:opacity-100">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-black border"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => moveItemUp(index)}
                                      disabled={index === 0}
                                    >
                                      <ArrowLeft size={20} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Down order</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-white border"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        removeMergeOrder(
                                          item.type,
                                          item.pdfId,
                                          item.order
                                        )
                                      }
                                    >
                                      <Trash2 size={20} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Remove from order
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Button
                                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-black border"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => moveItemDown(index)}
                                      disabled={index === mergeOrder.length - 1}
                                    >
                                      <ArrowRight size={20} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Up order</TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                            <img
                              className={`${
                                subPdfImages[item.pdfId][0] !==
                                subPdfImages[item.pdfId][1]
                                  ? "absolute"
                                  : " "
                              } h-auto w-auto object-contain max-w-48 max-h-64 border-2 border-gray-300 rounded-lg shadow-lg`}
                              src={subPdfImages[item.pdfId][0]}
                              alt="First Page"
                            />
                            {subPdfImages[item.pdfId][0] !==
                              subPdfImages[item.pdfId][1] && (
                              <img
                                className="h-auto w-auto object-contain max-w-48 max-h-64 border-2 border-gray-300
                                 rounded-lg shadow-lg ml-4 mt-2"
                                src={subPdfImages[item.pdfId][1]}
                                alt="Last Page"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row mt-4 gap-4">
                      <p>{getPageNumberAndType(item.pdfId, item.type)}</p>
                      <p className="text-sm font-normal">
                        ({item.type === "pdf" ? "Full PDF" : "Split Pages"})
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Button disabled={mergeOrder.length === 0} onClick={handleMerge}>
            Merge
          </Button>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default MergeOrderList;
