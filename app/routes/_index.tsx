import type { MetaFunction } from "@remix-run/node";
import AddPdfCard from "./dashboard/_components/AddPdfCard";
import PdfCard from "./dashboard/_components/PdfCard";
import { usePdf } from "app/contexts/pdf-context";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import MergeOrderList from "./dashboard/_components/MergeOrder";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { pdfFiles, mergePdfs } = usePdf();

  async function handleMerge() {
    try {
      const mergedBlob = await mergePdfs();
      if (mergedBlob) {
        const url = URL.createObjectURL(mergedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'merged.pdf'; // Name of the downloaded file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up to release memory
      }
    } catch (error) {
      console.error('Error during PDF merge:', error);
      // Handle the error appropriately
    }
  }
  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
      className="flex flex-col items-center justify-center min-h-screen py-2"
    >
      <AddPdfCard />
      <Card className="h-auto w-full p-8 grid grid-cols-1 justify-center items-center gap-4 mt-4 ">
        {pdfFiles &&
          pdfFiles.map((pdf) => (
            <PdfCard key={pdf.id} fileName={pdf.file.name} file={pdf} />
          ))}
      </Card>
      <Button onClick={handleMerge}>Merge</Button>
      <MergeOrderList/>
    </div>
  );
}
