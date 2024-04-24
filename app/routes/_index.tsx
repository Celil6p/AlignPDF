import type { MetaFunction } from "@remix-run/node";
import AddPdfCard from "./dashboard/_components/AddPdfCard";
import PdfCard from "./dashboard/_components/PdfCard";
import { usePdf } from "app/contexts/pdf-context";
import { Card } from "~/components/ui/card";
import MergeOrderList from "./dashboard/_components/MergeOrder";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { pdfFiles, mergePdfs } = usePdf();

  const sortedPdfFiles = [...pdfFiles].sort((a, b) => {
    if (a.subFiles && a.subFiles.length > 0) return -1;
    if (b.subFiles && b.subFiles.length > 0) return 1;
    return 0;
  });
  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
      className="flex flex-col items-center justify-center min-h-screen py-2"
    >
      <AddPdfCard />
      {pdfFiles.length > 0 && <Card className="h-auto w-full p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center items-center gap-4 mt-4 transition-all">
        {sortedPdfFiles.map((pdf) => (
          <div 
            key={pdf.id}
            className={pdf.subFiles && pdf.subFiles.length > 0 ? "col-span-full" : ""}
          >
            <PdfCard fileName={pdf.file.name} file={pdf} />
          </div>
        ))}
      </Card>}
      <MergeOrderList/>
    </div>
  );
}
