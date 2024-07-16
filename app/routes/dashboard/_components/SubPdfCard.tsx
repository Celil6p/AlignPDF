import React, { useEffect, useState } from "react";
import { Combine, Loader2, Trash2, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { db } from "~/contexts/db";
import { usePdf } from "~/contexts/pdf-context";
import { PdfSubFile, PdfFile } from "~/contexts/types/pdf";
import { getPage } from "~/lib/get-page";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import RemovePdfDialog from "./RemovePdfDialog";
import AddToMergeOrderButton from "./AddToMergeOrderButton";

type SubPdfCardProps = {
  parentFile: PdfFile;
  subFile: PdfSubFile;
};

const SubPdfCard = ({ subFile, parentFile }: SubPdfCardProps) => {
  const [subPagesImageUrl, setSubPagesImageUrl] = useState<[string, string]>([
    "public/placeholder-pdf-image.png",
    "public/placeholder-pdf-image.png",
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mergeCount, setMergeCount] = useState(0);
  const { addPdfToMergeOrder, removeSubPdf, mergeOrder } = usePdf();

  useEffect(() => {
    const fetchSubPages = async () => {
      setIsLoading(true);
  
      if (subFile && typeof subFile.id === "number") {
        const storedImages = await db.subFileImages.get(subFile.id);
        if (storedImages) {
          setSubPagesImageUrl(storedImages.imageUrls);
          setIsLoading(false);
          return;
        }
  
        try {
          const initialPageUrl = await getPage(parentFile, subFile.range[0]);
          const finalPageUrl = await getPage(parentFile, subFile.range[1]);
          setSubPagesImageUrl([initialPageUrl, finalPageUrl]);
          setIsLoading(false);
  
          // Update the entry or create a new one if it doesn't exist
          await db.subFileImages.put({
            imageUrls: [initialPageUrl, finalPageUrl],
            subPdfId: subFile.id,
            parentPdfId: parentFile.id,
          });
  
        } catch (error) {
          console.error("Error fetching pages of child PDF", error);
          setIsLoading(false);
        }
      } else {
        console.error("Error: sub PDF file is missing an ID.");
        setIsLoading(false);
        setSubPagesImageUrl([
          "public/placeholder-pdf-image.png",
          "public/placeholder-pdf-image.png",
        ]);
      }
    };
  
    fetchSubPages();
  }, [subFile, parentFile]);
  
  useEffect(() => {
    const count = mergeOrder.filter(item => item.pdfId === subFile.id && item.type === "subPdf").length;
    setMergeCount(count);
  }, [mergeOrder, subFile.id]);

  const loaderColors = [
    "text-red-700",
    "text-blue-700",
    "text-yellow-700",
    "text-green-700",
    "text-purple-700",
    "text-orange-700",
    "text-indigo-700",
    "text-pink-700",
    "text-fushcia-700",
  ];

  return (
    <Card className="flex flex-col-1 sm:flex-col-2 md:flex-col-3 lg:flex-col-4 xl:flex-col-5 items-center justify-center transition-all duration-500 h-[380px] min-w-56 border-none bg-">
      <div className="flex items-center justify-center flex-col h-full">
        <CardContent className="relative flex justify-center">
          {isLoading ? (
            <div>
              <Loader2
                className={`animate-spin ${
                  loaderColors[(parentFile.id as number) % 8]
                }`}
                size={40}
                strokeWidth={2.25}
              />
            </div>
          ) : subPagesImageUrl ? (
            <div className="relative">
              <img
                className={`h-auto w-auto overflow-clip max-w-40 border-2 rounded-lg ${
                  subPagesImageUrl[0] !== subPagesImageUrl[1] ? "absolute" : ""
                }`}
                src={subPagesImageUrl[0]}
                alt="PDF First Page"
              />
              {subPagesImageUrl[0] !== subPagesImageUrl[1] && (
                <img
                  className="h-auto w-auto overflow-clip max-w-40 border-2 rounded-lg ml-4 mt-2"
                  src={subPagesImageUrl[1]}
                  alt="PDF Last Page"
                />
              )}
              {mergeCount > 0 && (
                <div 
                  className={`absolute -top-4 -right-4 z-10 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold ${
                    mergeCount === 1 ? 'bg-green-500' : 'bg-yellow-500'
                  } text-white shadow-lg`}
                >
                  {mergeCount === 1 ? <Check size={24} /> : mergeCount}
                </div>
              )}
            </div>
          ) : (
            <span>No image available</span>
          )}

          <div className="absolute opacity-80 sm:opacity-0 flex space-x-2 justify-center items-center w-full h-full bg-opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-90 hover:opacity-100">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                <AddToMergeOrderButton fileId={subFile.id as number} type="subPdf" />
                </TooltipTrigger>
                <TooltipContent>Add to Merge Order</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                <RemovePdfDialog fileId={subFile.id as number} type="subPdf" parentId={parentFile.id as number} />
                </TooltipTrigger>
                <TooltipContent>Remove Sub PDF</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
        {subFile.range[0] !== subFile.range[1] ? (
          <p>
            {subFile.range[0]} to {subFile.range[1]} Pages
          </p>
        ) : (
          <p>Page {subFile.range[0]}</p>
        )}
      </div>
    </Card>
  );
};

export default SubPdfCard;