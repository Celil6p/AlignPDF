import React, { useState } from "react";
import { usePdf } from "app/contexts/pdf-context"; // Adjust the path as necessary
import { FilePlus } from "lucide-react";

interface AddPdfCardProps {
  className?: string;
  decription?: string;
}

const AddPdfCard: React.FC<AddPdfCardProps> = ({ className = "" ,decription = ""}) => {
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
    <div className={`w-full h-full ${className}`}>
      <div
        className={`p-4 border-2 w-full h-full ${
          isDragActive ? "border-blue-400" : "border-gray-300"
        } border-dashed rounded-lg cursor-pointer hover:border-gray-400 flex items-center justify-center`}
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
        <label htmlFor="pdf-upload" className="text-center cursor-pointer">
          <div className="flex flex-col items-center justify-center">
            <FilePlus
              className={`w-12 h-12 mb-2 ${
                isDragActive ? "text-blue-400" : "text-gray-600"
              }`}
            />
            <p className={`text-sm ${isDragActive ? "text-blue-400" : "text-gray-600"}`}>
              {decription}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default AddPdfCard;
