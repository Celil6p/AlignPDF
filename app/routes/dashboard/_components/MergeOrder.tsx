import { useEffect, useState } from "react";
import { usePdf } from "app/contexts/pdf-context"; // Adjust the import path as needed
import { db } from "app/contexts/db"; // Adjust the import path as needed
import { MergeOrderItem } from "app/contexts/types/pdf";


const MergeOrderList = () => {
  const { pdfFiles } = usePdf();
  const [mergeOrder, setMergeOrder] = useState<MergeOrderItem[]>([]);
  useEffect(() => {
    const fetchMergeOrder = async () => {
      try {
        const fetchedMergeOrder = await db.mergeOrders
          .orderBy("order")
          .toArray();
        setMergeOrder(fetchedMergeOrder);
      } catch (error) {
        console.error("Error fetching merge order from database:", error);
      }
    };

    fetchMergeOrder();
  }, []);

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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MergeOrderList;
