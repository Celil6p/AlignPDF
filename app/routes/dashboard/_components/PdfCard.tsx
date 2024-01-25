import React, { useEffect, useState } from "react";

import { getPage } from "app/lib/get-page";
import { bytesToSize } from "~/lib/utils";
import { PdfFile, PdfSubFile } from "~/contexts/types/pdf";
import { db } from "~/contexts/db";
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
import { Trash2, XCircle } from "lucide-react";
import SubPdfCard from "./SubPdfCard";

interface PdfCardProps {
  fileName: string;
  file: PdfFile; // Adjusted for clarity, assuming 'file' is of type File
}

const PdfCard: React.FC<PdfCardProps> = ({ fileName, file }) => {
  const { addPdfToMergeOrder, removePdf, createSubFile } = usePdf();

  /**************************************************************************************************** */
  const [showFooter, setShowFooter] = useState(false);

  // Toggle function
  const toggleContent = () => {
    setShowFooter(!showFooter);
  };
  /**************************************************************************************************** */

  const [firstPageImageUrl, setFirstPageImageUrl] = useState<string>(
    "public/placeholder-pdf-image.png"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true); // State to track loading status

  useEffect(() => {
    const fetchFirstPage = async () => {
      setIsLoading(true);

      // Ensure file.id is defined
      if (file && typeof file.id === "number") {
        // Check if the image URL is already stored in Dexie
        const storedImage = await db.firstPageImages.get(file.id);
        if (storedImage) {
          setFirstPageImageUrl(storedImage.imageUrl);
          setIsLoading(false);
          return;
        }

        try {
          const url = await getPage(file, 1);
          setFirstPageImageUrl(url);
          setIsLoading(false);

          // Store the new image URL in Dexie
          await db.firstPageImages.add({ pdfId: file.id, imageUrl: url });
        } catch (error) {
          console.error("Error fetching first page of PDF", error);
          setIsLoading(false);
        }
      } else {
        // Handle the case where file.id is undefined
        console.error("Error: PDF file is missing an ID.");
        setIsLoading(false);
        setFirstPageImageUrl("public/placeholder-pdf-image.png"); // Clear any existing image URL
        // Optionally, set a state to display an error message in the UI
      }
    };

    fetchFirstPage();
  }, [file]);

  /*********************************************************************************************************************************************** */

  const [initialPage, setInitialPage] = useState<number>(1);
  const [finalPage, setFinalPage] = useState<number>(file.pages);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(initialPage, finalPage);
    createSubFile(file.id as number, [initialPage, finalPage]);
  };

  /*********************************************************************************************************************************************** */

  let strippedFileName = fileName.substring(0, fileName.lastIndexOf("."));
  if (strippedFileName.length > 23) {
    strippedFileName = strippedFileName.substring(0, 20) + "...";
  }

  /*********************************************************************************************************************************************** */

  const readableSize: string = bytesToSize(file.size);

  /*********************************************************************************************************************************************** */

  const handleAddToMergeOrder = () => {
    addPdfToMergeOrder("pdf", file.id as number);
  };

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

  return (
    <div
      className={`flex flex-row items-start justify-start w-full h-full bg-pi ${
        pdfBgColors[(file.id as number) % 8]
      } rounded-md`}
    >
      <Card className="flex flex-col items-center transition-all duration-500 h-80 min-w-56 border-none bg-">
        <CardHeader className="flex flex-row justify-between items-center h-10 w-full text-sm font-medium text-gray-900 truncate  ">
          <p>{strippedFileName}</p>
          <div className="relative h-full w-full">
            {showFooter && (
              <button
                onClick={toggleContent}
                className="absolute top-[-15px] right-[-15px]"
              >
                <XCircle size={20} />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent
          className={`flex items-center justify-center flex-col h-full transition-all duration-500 ${
            showFooter ? "hidden" : "block"
          }`}
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : firstPageImageUrl ? (
            <img
              onClick={toggleContent}
              className={`h-auto w-auto overflow-clip max-w-44 border-4 ${
                pdfBorderColors[(file.id as number) % 8]
              } rounded-lg`}
              src={firstPageImageUrl}
              alt="PDF First Page"
            />
          ) : (
            <span>No image available</span> // Displayed if there's no image URL
          )}
          <Button
            type="submit"
            variant={"default"}
            onClick={handleAddToMergeOrder}
          >
            Merge
          </Button>
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
          <div className="relative h-10 w-full">
            <Button
              variant={"destructive"}
              className={"absolute bottom-0 right-4"}
              onClick={() => removePdf(file.id as number)}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        </div>
      </Card>
      {file.subFiles.map((subFile) => (
        <SubPdfCard key={subFile.id} subFile={subFile} parentFile={file} />
      ))}
    </div>
  );
};

export default PdfCard;
