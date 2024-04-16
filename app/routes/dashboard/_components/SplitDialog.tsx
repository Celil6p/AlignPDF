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
    console.log('First Page URL:', url);
  };

  const handleLastPageUrlChange = (url: string) => {
    setLastPageUrl(url);
    console.log('Last Page URL:', url);
  };

  return (
    <Dialog >
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
          <div className="flex items-center justify-center">
          {firstPageUrl && <img src={firstPageUrl} alt="First Page" className="max-w-44 max-h-96 hover:scale-x-[2.2] hover:scale-y-[2.2] hover:z-10 transform-gpu transition-transform"/>}
          {lastPageUrl && <img src={lastPageUrl} alt="Last Page" className="max-w-44 max-h-96 hover:scale-x-[2.2] hover:scale-y-[2.2] hover:z-10 transform-gpu transition-transform"/>}
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