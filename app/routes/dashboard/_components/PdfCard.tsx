import React, { useEffect, useState } from "react";

import { bytesToSize } from "~/utils/bytesToSize";
import { PdfFile } from "~/contexts/types/pdf";
import { Button } from "~/components/ui/button";
import { usePdf } from "app/contexts/pdf-context"; // Adjust the path as necessary
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Combine, Loader2, SplitSquareHorizontal, Trash2 } from "lucide-react";
import SubPdfCard from "./SubPdfCard";
import SplitDialog from "./SplitDialog";

interface PdfCardProps {
  fileName: string;
  file: PdfFile; // Adjusted for clarity, assuming 'file' is of type File
}

const PdfCard: React.FC<PdfCardProps> = ({ fileName, file }) => {
  const { addPdfToMergeOrder, removePdf, getFirstPage } = usePdf();

  // Get first page of main pdf file
  /**************************************************************************************************** */

  const [firstPageImageUrl, setFirstPageImageUrl] = useState<string>(
    "public/placeholder-pdf-image.png"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true); // State to track loading status

  useEffect(() => {
    let isMounted = true;
    const fetchFirstPageImage = async () => {
      setIsLoading(true);
      const imageUrl = await getFirstPage(file);
      if (isMounted) {
        setFirstPageImageUrl(imageUrl);
        setIsLoading(false);
      }
    };

    fetchFirstPageImage();

    return () => {
      isMounted = false;
      // If the imageUrl is a blob URL, revoke it
      if (firstPageImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(firstPageImageUrl);
      }
    };
  }, [file, getFirstPage]);

  // Pdf size human readable
  /*********************************************************************************************************************************************** */

  const readableSize: string = bytesToSize(file.size);

  // Main pdf file merge order
  /*********************************************************************************************************************************************** */

  const handleAddToMergeOrder = () => {
    addPdfToMergeOrder("pdf", file.id as number);
  };

  // Main pdf border and background color arrays
  /*********************************************************************************************************************************************** */

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
    <div
      className={`${
        file.subFiles.length > 0
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : ""
      } items-start justify-start w-full h-full bg-  ${
        pdfBgColors[(file.id as number) % 8]
      } rounded-md`}
    >
      {/* Main Pdf background colors selected via id numbers on top line*/}
      <Card className="flex flex-col items-center transition-all duration-500 h-[380px] min-w-56 border-none bg-">
        <CardHeader className="flex flex-row justify-between items-center h-10 w-full text-sm font-medium text-gray-900 truncate">
          <p className="truncate w-full">{fileName}</p>
        </CardHeader>
        <CardContent
          className={`relative flex items-center justify-center flex-col h-full transition-all duration-500`}
        >
          {/* Main Pdf border colors selected via id numbers*/}
          <div className="relative flex justify-center">
            {isLoading ? (
              <Loader2
                className={`animate-spin ${
                  loaderColors[(file.id as number) % 8]
                }`}
                size={40}
                strokeWidth={2.25}
              />
            ) : firstPageImageUrl ? (
              <img
                className={`h-auto w-auto overflow-clip max-w-48 max-h-64 border-4 ${
                  pdfBorderColors[(file.id as number) % 8]
                } rounded-lg`}
                src={firstPageImageUrl}
                alt="PDF First Page"
              />
            ) : (
              <span>No image available</span> // Displayed if there's no image URL
            )}
            {/* Buttons */}
            <TooltipProvider>
              <div className="absolute opacity-80 sm:opacity-0 flex space-x-2 justify-center items-center w-full h-full bg-opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-90 hover:opacity-100">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-white border"
                      onClick={handleAddToMergeOrder}
                    >
                      <Combine size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Merge Order</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <SplitDialog rangeMin={1} rangeMax={file.pages} file={file}>
                      <Button className="opacity-100 transition-colors duration-300 ease-in-out bg-blue-700 hover:bg-blue-800 group-hover:scale-100 sm:hover:scale-110 border-white border">
                        <SplitSquareHorizontal size={20} />
                      </Button>
                    </SplitDialog>
                  </TooltipTrigger>
                  <TooltipContent>Split Pdf</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant={"destructive"}
                      className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-white border"
                      onClick={() => removePdf(file.id as number)}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove Pdf</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row justify-between space-x-10 items-center">
          <p>{readableSize}</p>
          <p>{`${file.pages > 1 ? file.pages + " Pages" : "Single Page"}`}</p>
        </CardFooter>
      </Card>
      {file.subFiles.map((subFile) => (
        <SubPdfCard key={subFile.id} subFile={subFile} parentFile={file} />
      ))}
    </div>
  );
};

export default PdfCard;
