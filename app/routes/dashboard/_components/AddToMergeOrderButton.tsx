import React, { useState, useEffect } from 'react';
import { Button } from "~/components/ui/button";
import { Combine } from "lucide-react";
import { usePdf } from "app/contexts/pdf-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface AddToMergeOrderButtonProps {
  fileId: number;
  type: "pdf" | "subPdf";
}

const AddToMergeOrderButton: React.FC<AddToMergeOrderButtonProps> = ({ fileId, type }) => {
  const { addPdfToMergeOrder, mergeOrder } = usePdf();
  const [mergeCount, setMergeCount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const count = mergeOrder.filter(item => item.pdfId === fileId && item.type === type).length;
    setMergeCount(count);
  }, [mergeOrder, fileId, type]);

  const handleAddToMergeOrder = async () => {
    if (mergeCount === 0 || mergeCount > 1) {
      await addPdfToMergeOrder(type, fileId);
    } else if (mergeCount === 1) {
      setDialogOpen(true);
    }
  };

  const handleConfirmSecondAdd = async () => {
    await addPdfToMergeOrder(type, fileId);
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        className="opacity-100 transition-transform duration-300 ease-in-out group-hover:scale-100 sm:hover:scale-110 border-white border"
        onClick={handleAddToMergeOrder}
      >
        <Combine size={20} />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Merge Order Again?</DialogTitle>
            <DialogDescription>
              This item is already in the merge order. Do you want to add it again?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmSecondAdd}>Add Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToMergeOrderButton;