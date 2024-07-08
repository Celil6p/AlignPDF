import React from 'react';
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { usePdf } from "app/contexts/pdf-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface RemovePdfDialogProps {
  fileId: number;
  type: "pdf" | "subPdf";
  parentId?: number;
}

const RemovePdfDialog: React.FC<RemovePdfDialogProps> = ({ fileId, type, parentId }) => {
  const { removePdf, removeSubPdf, mergeOrder, pdfFiles } = usePdf();
  const [open, setOpen] = React.useState(false);

  const handleRemove = () => {
    if (type === "pdf") {
      removePdf(fileId);
    } else {
      removeSubPdf(fileId, parentId!);
    }
    setOpen(false);
  };

  const mergeOrderCount = mergeOrder.filter(item => item.pdfId === fileId && item.type === type).length;
  
  const pdfFile = pdfFiles.find(pdf => pdf.id === (type === "pdf" ? fileId : parentId));
  const splitPagesCount = type === "pdf" ? pdfFile?.subFiles.length || 0 : 0;

  const shouldShowDialog = mergeOrderCount > 0 || splitPagesCount > 0;

  const handleClick = () => {
    if (shouldShowDialog) {
      setOpen(true);
    } else {
      handleRemove();
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-white border"
        onClick={handleClick}
      >
        <Trash2 size={20} />
      </Button>

      {shouldShowDialog && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove {type === "pdf" ? "PDF" : "Sub-PDF"}</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this {type === "pdf" ? "PDF" : "sub-PDF"}?
              </DialogDescription>
            </DialogHeader>
            <div>
              {mergeOrderCount > 0 && (
                <p className='text-red-500 py-2'>
                  This {type === "pdf" ? "PDF" : "sub-PDF"} is in the merge order {mergeOrderCount} time{mergeOrderCount !== 1 ? 's' : ''}.
                </p>
              )}
              {type === "pdf" && splitPagesCount > 0 && (
                <p className='text-red-500 py-2'>
                  This PDF has {splitPagesCount} split page{splitPagesCount !== 1 ? 's' : ''}.
                </p>
              )}
              All related items will be removed.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemove}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default RemovePdfDialog;