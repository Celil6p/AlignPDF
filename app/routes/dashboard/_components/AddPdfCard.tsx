import React, { useState } from "react";
import { usePdf } from "app/contexts/pdf-context"; // Adjust the path as necessary
import { FilePlus } from "lucide-react";

const AddPdfCard: React.FC = () => {
  const { addPdfFile } = usePdf();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => addPdfFile(file));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);

    const files = event.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type === "application/pdf") {
          addPdfFile(file);
        }
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  return (
    <div
      className={`p-4 border-2 w-full h-full mx-10 ${
        isDragActive ? "border-blue-400" : "border-gray-300"
      } border-dashed rounded-lg cursor-pointer hover:border-gray-400`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        className="hidden"
        id="pdf-upload"
        accept="application/pdf"
        multiple
        onChange={handleFileSelect}
      />
      <label htmlFor="pdf-upload" className="text-center">
        <div className="flex flex-col items-center justify-center">
          <FilePlus
            className={`w-12 h-12 mb-1${
              isDragActive ? "text-blue-400" : "text-gray-600"
            }`}
            style={{ color: isDragActive ? "#60a5fa" : "#4b5563" }}
          />
          <p className={`${isDragActive ? "text-blue-400" : "text-gray-600"
            }`}>
            Drag and drop PDFs here, or click to select files
          </p>
        </div>
      </label>
    </div>
  );
};

export default AddPdfCard;
