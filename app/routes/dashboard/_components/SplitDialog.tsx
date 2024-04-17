import { ReactNode, useState } from "react";
import DoubleRangeSlider from "~/components/double-slider";
import { PdfFile } from "~/contexts/types/pdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

type Props = {
  children?: ReactNode;
  rangeMin: number;
  rangeMax: number;
  file: PdfFile;
};

const SplitDialog = (props: Props) => {
  const [firstPageUrl, setFirstPageUrl] = useState('');
  const [lastPageUrl, setLastPageUrl] = useState('');

  const handleFirstPageUrlChange = (url: string) => {
    setFirstPageUrl(url);
  };

  const handleLastPageUrlChange = (url: string) => {
    setLastPageUrl(url);
  };

  return (
    <Dialog >
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Please select {!lastPageUrl && <span>the</span>} page{lastPageUrl && <span>s</span>} you want to split </DialogTitle>
          <div className="h-64 w-full flex items-center justify-center">
          {firstPageUrl && <img src={firstPageUrl} alt="First Page" className="max-w-44 max-h-96 sm:hover:scale-x-[1.7] sm:hover:scale-y-[1.7] sm:hover:z-10 sm:hover:-translate-y-16 transform-gpu transition-transform"/>}
          {lastPageUrl && <img src={lastPageUrl} alt="Last Page" className="max-w-44 max-h-96 sm:hover:scale-x-[1.7] sm:hover:scale-y-[1.7] sm:hover:z-10 sm:hover:-translate-y-16 transform-gpu transition-transform"/>}
          </div>
        </DialogHeader>
        <DoubleRangeSlider
          min={props.rangeMin}
          max={props.rangeMax}
          file={props.file}
          onFirstPageUrlChange={handleFirstPageUrlChange}
          onLastPageUrlChange={handleLastPageUrlChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SplitDialog;