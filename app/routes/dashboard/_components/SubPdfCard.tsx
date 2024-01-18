import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { db } from "~/contexts/db";
import { usePdf } from "~/contexts/pdf-context";
import { PdfSubFile, PdfFile } from "~/contexts/types/pdf";
import { getPage } from "~/lib/get-page";

type SubPdfCardProps = {
  parentFile: PdfFile;
  subFile: PdfSubFile;
};

const SubPdfCard = ({ subFile, parentFile }: SubPdfCardProps) => {
  const [subPagesImageUrl, setSubPagesImageUrl] = useState<[string, string]>([
    "public/placeholder-pdf-image.png",
    "public/placeholder-pdf-image.png",
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // State to track loading status
  const { addPdfToMergeOrder } = usePdf()

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

          console.log("success db update");
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
  }, [subFile]); // Updated dependency array

  const [showFooter, setShowFooter] = useState(false);

  // Toggle function
  const toggleContent = () => {
    setShowFooter(!showFooter);
  };

  const handleAddToMergeOrder = () => {
    addPdfToMergeOrder('subPdf', subFile.id as number);
  };

  return (
    <Card className="flex flex-col items-center transition-all duration-500 h-80 min-w-56 border-none bg-">
      <CardContent
        className={`flex items-center justify-center flex-col h-full transition-all duration-500 ${
          showFooter ? "hidden" : "block"
        }`}
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : subPagesImageUrl ? (
          <img
            onClick={toggleContent}
            className="h-auto w-auto overflow-clip max-w-44 border-4 border-red-700 rounded-lg"
            src={subPagesImageUrl[0]}
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
        <div className="relative h-10 w-full">
          {/* <Button
            variant={"destructive"}
            className={"absolute bottom-0 right-4"}
            onClick={() => removePdf(subFile.id as number)}
          >
            <Trash2 size={20} />
          </Button> */}
        </div>
      </div>
    </Card>
  );
};

export default SubPdfCard;
