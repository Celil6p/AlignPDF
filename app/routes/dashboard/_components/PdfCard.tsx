import React, { useEffect, useState } from "react";

// Assuming GetPage is an async function that takes a PdfFile and returns a URL
import { getPage } from "app/lib/get-page";
import { PdfFile } from "~/contexts/types/pdf";
import { db } from "~/contexts/db";
import { Button } from "~/components/ui/button";
import { usePdf } from "app/contexts/pdf-context"; // Adjust the path as necessary
import { Input } from "~/components/ui/input";

interface PdfCardProps {
  fileName: string;
  file: PdfFile; // Adjusted for clarity, assuming 'file' is of type File
}

const PdfCard: React.FC<PdfCardProps> = ({ fileName, file }) => {
  const { removePdf, createSubFile } = usePdf();

  /**************************************************************************************************** */

  const [firstPageImageUrl, setFirstPageImageUrl] = useState<string>("");
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
        setFirstPageImageUrl(""); // Clear any existing image URL
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
  function bytesToSize(bytes: number): string {
    const sizes: string[] = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i: number = parseInt(
      Math.floor(Math.log(bytes) / Math.log(1024)).toString()
    );
    return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
  }

  const fileSize: number = file.size; // Replace file.size with your file's size in bytes
  const readableSize: string = bytesToSize(fileSize);

  /*********************************************************************************************************************************************** */

  return (
    <div className="p-6 border rounded-lg shadow-sm w-auto min-w-32 max-w-60 h-80 ">
      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-gray-900 truncate">
            {strippedFileName}
          </p>
          {isLoading ? (
            <span>Loading...</span>
          ) : firstPageImageUrl ? (
            <img
              className="h-auto w-auto overflow-clip max-w-44"
              src={firstPageImageUrl}
              alt="PDF First Page"
            />
          ) : (
            <span>No image available</span> // Displayed if there's no image URL
          )}
          <p>{readableSize}</p>
          <div className="flex flex-row space-x-2">
            <Button
              variant={"destructive"}
              className={"rounded-full"}
              onClick={() => removePdf(file.id as number)}
            >
              X
            </Button>
            {/********************************************************************************************************** */}
            {/**form sends initial and final page number of the subfile to the createSubFile function in the pdf context */}

            <form className="flex flex-row space-x-2" onSubmit={handleSubmit}>
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

              {/********************************************************************************************************** */}
              <button type="submit">=</button>
            </form>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Additional file info can go here */}
        </div>
      </div>
    </div>
  );
};

export default PdfCard;
