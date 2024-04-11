import React, { useEffect, useState } from "react";

import { bytesToSize } from "~/lib/utils";
import { PdfFile } from "~/contexts/types/pdf";
import { Button } from "~/components/ui/button";
import { usePdf } from "app/contexts/pdf-context"; // Adjust the path as necessary
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";

import { Label } from "@radix-ui/react-label";
import {
  Combine,
  Loader2,
  SplitSquareHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import SubPdfCard from "./SubPdfCard";
import SplitDialog from "./SplitDialog";

interface PdfCardProps {
  fileName: string;
  file: PdfFile; // Adjusted for clarity, assuming 'file' is of type File
}

const PdfCard: React.FC<PdfCardProps> = ({ fileName, file }) => {
  const { addPdfToMergeOrder, removePdf, createSubFile, getFirstPage } =
    usePdf();

  //Displays page splitting menu
  /**************************************************************************************************** */
  const [showFooter, setShowFooter] = useState(false);

  // Toggle function
  const toggleContent = () => {
    setShowFooter(!showFooter);
  };

  // Get first page of main pdf file
  /**************************************************************************************************** */

  const [firstPageImageUrl, setFirstPageImageUrl] = useState<string>(
    "public/placeholder-pdf-image.png"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true); // State to track loading status

  useEffect(() => {
    const fetchFirstPageImage = async () => {
      setIsLoading(true);
      const imageUrl = await getFirstPage(file);
      setFirstPageImageUrl(imageUrl);
      setIsLoading(false);
    };

    fetchFirstPageImage();
  }, [file, getFirstPage]);

  //Create a sub file between selected pages

  const [initialPage, setInitialPage] = useState<number>(1);
  const [finalPage, setFinalPage] = useState<number>(file.pages);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(initialPage, finalPage);
    createSubFile(file.id as number, [initialPage, finalPage]);
  };

  const handleRangeChange = (lower: number, upper: number) => {
    setInitialPage(lower);
    setFinalPage(upper);
  };

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
      <Card className="flex flex-col items-center transition-all duration-500 h-80 min-w-56 border-none bg-">
        <CardHeader className="flex flex-row justify-between items-center h-10 w-full text-sm font-medium text-gray-900 truncate">
          <p className="truncate w-full">{fileName}</p>

          {/* Pdf splitting menu */}
          {/*********************************************************************************************************************** */}
          <div className="relative w-1/5">
            {showFooter && (
              <button
                onClick={toggleContent}
                className="absolute top-[-15px] right-[-15px]"
              >
                <XCircle size={20} />
              </button>
            )}
          </div>
          {/*********************************************************************************************************************** */}
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
                onClick={toggleContent}
                className={`h-auto w-auto overflow-clip max-w-48 max-h-64 border-4 ${
                  pdfBorderColors[(file.id as number) % 8]
                } rounded-lg`}
                src={firstPageImageUrl}
                alt="PDF First Page"
              />
            ) : (
              <span>No image available</span> // Displayed if there's no image URL
            )}
            {showFooter && (
              <div
                className={`absolute flex space-x-2 justify-center items-center${showFooter} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
              >
                <Button
                  className="animate-scaleUp"
                  onClick={handleAddToMergeOrder}
                >
                  <Combine size={20} />
                </Button>
                <SplitDialog rangeMin={1} rangeMax={file.pages} file={file}>
                  <Button className="animate-scaleUp bg-blue-700 hover:bg-blue-800">
                    <SplitSquareHorizontal size={20} />
                  </Button>
                </SplitDialog>
                <Button
                  variant={"destructive"}
                  className="animate-scaleUp"
                  onClick={() => removePdf(file.id as number)}
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <div
          className={`transition-opacity duration-500 ${
            showFooter ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <CardFooter className="relative w-full h-full">
            <div className="flex flex-row space-x-2">
              {/********************************************************************************************************** */}
              {/**form sends initial and final page number of the subfile to the createSubFile function in the pdf context */}

              <form
                className="flex flex-col items-start gap-2 "
                onSubmit={handleSubmit}
              >
                <Label className="text-sm font-medium text-gray-900 truncate">
                  Split PDF pages
                </Label>
                <div className="flex flex-row space-x-2">
                  <Input
                    type="number"
                    className=""
                    value={initialPage}
                    onChange={(e) => {
                      const newInitialPage = parseInt(e.target.value, 10);
                      if (newInitialPage >= 1 && newInitialPage <= finalPage) {
                        setInitialPage(newInitialPage);
                      }
                    }}
                    placeholder="Initial Page"
                    required
                  />
                  <p>_</p>
                  <Input
                    type="number"
                    className=""
                    value={finalPage}
                    onChange={(e) => {
                      const newFinalPage = parseInt(e.target.value, 10);
                      if (
                        newFinalPage >= initialPage &&
                        newFinalPage <= file.pages
                      ) {
                        setFinalPage(newFinalPage);
                      }
                    }}
                    placeholder="Final Page"
                    required
                  />
                </div>

                {/********************************************************************************************************** */}
                <Button type="submit" variant={"default"}>
                  Split
                </Button>
                <p>{readableSize}</p>
              </form>
            </div>
            {/* Additional file info can go here */}
          </CardFooter>
          <div className="relative h-10 w-full"></div>
        </div>
      </Card>
      {file.subFiles.map((subFile) => (
        <SubPdfCard key={subFile.id} subFile={subFile} parentFile={file} />
      ))}
    </div>
  );
};

export default PdfCard;
