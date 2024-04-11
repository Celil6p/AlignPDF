import { ReactNode } from "react";
import DoubleRangeSlider from "~/components/double-slider";
import { PdfFile } from "~/contexts/types/pdf";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "~/components/ui/dialog"
  
type Props = {
    children?: ReactNode;
    rangeMin: number;
    rangeMax: number
    file: PdfFile
}

const SplitDialog = (props: Props) => {
  return (
<Dialog>
  <DialogTrigger>{props.children}</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
    <DoubleRangeSlider min={props.rangeMin} max={props.rangeMax} file={props.file} />
  </DialogContent>
</Dialog>

  )
}

export default SplitDialog