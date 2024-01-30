import { usePdf } from "app/contexts/pdf-context"; // Adjust the import path as needed
import { useEffect,useState } from "react";
import { Card, CardContent } from "~/components/ui/card";

const MergeOrderList = () => {
  const { pdfFiles, mergeOrder, getFirstPage } = usePdf();

  const [firstPageImages, setFirstPageImages] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    const fetchFirstPageImages = async () => {
      const images: Record<number, string> = {};

      for (const item of mergeOrder) {
        if (item.type === "pdf") {
          const pdf = pdfFiles.find((pdf) => pdf.id === item.pdfId);
          if (pdf) {
            images[item.pdfId] = await getFirstPage(pdf);
          }
        }
      }

      setFirstPageImages(images);
    };
    fetchFirstPageImages();
  }, [mergeOrder, pdfFiles, getFirstPage]);

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

  return (
    <div>
      <h2>Merge Order</h2>
      <ul>
        {mergeOrder.map((item, index) => (
          <li key={index}>
            {getFileName(item.pdfId, item.type)} (
            {item.type === "pdf" ? "Full PDF" : "Split Pages"})
            {item.type === "pdf" && firstPageImages[item.pdfId] && (
              <img src={firstPageImages[item.pdfId]} alt="First Page" />
            )}
          </li>
        ))}
      </ul>
    </div>
    // <>
    //   {mergeOrder.length > 0 && (
    //     <Card className="h-auto w-full p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center items-center gap-4 mt-4 transition-all">
    //       {mergeOrder.map((item, index) => (
    //       <div>
    //       <h2 key={index}>
    //         {getFileName(item.pdfId, item.type)} (
    //         {item.type === "pdf" ? "Full PDF" : "Split Pages"})
    //       </h2>
    //       <CardContent
    //       className={`flex items-center justify-center flex-col h-full transition-all duration-500 ${
    //         showFooter ? "hidden" : "block"
    //       }`}
    //     >
    //       {/* Main Pdf border colors selected via id numbers*/}

    //       {isLoading ? (
    //         <span>Loading...</span>
    //       ) : firstPageImageUrl ? (
    //         <img
    //           className={`h-auto w-auto overflow-clip max-w-44 border-4 ${
    //             pdfBorderColors[(file.id as number) % 8]
    //           } rounded-lg`}
    //           src={firstPageImageUrl}
    //           alt="PDF First Page"
    //         />
    //       ) : (
    //         <span>No image available</span> // Displayed if there's no image URL
    //       )}
    //       </CardContent>
    //       </div>
    //     ))}

    //     </Card>
    //   )}
    // </>
  );
};

export default MergeOrderList;