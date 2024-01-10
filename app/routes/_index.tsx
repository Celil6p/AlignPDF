import type { MetaFunction } from "@remix-run/node";
import AddPdfCard from "./dashboard/_components/AddPdfCard";
import PdfCard from "./dashboard/_components/PdfCard";
import { usePdf } from "app/contexts/pdf-context";


export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { pdfFiles } = usePdf();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }} className="flex flex-col items-center justify-center min-h-screen py-2">
      <AddPdfCard/>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center items-center gap-4  mt-4 space-x4">
      {pdfFiles &&
        pdfFiles.map((pdf) => (
          <PdfCard key={pdf.id} fileName={pdf.file.name} file={pdf} />
        ))}
      </div>
    </div>
  );
}
