import React, { useEffect, useState } from "react";
import {
  Slider,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
} from "@mui/material";
import { Check, X } from "lucide-react";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { Button } from "./ui/button";
import { usePdf } from "app/contexts/pdf-context";
import { PdfFile } from "~/contexts/types/pdf";
import { toast } from "sonner";

interface DoubleRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  file: PdfFile;
  onFirstPageUrlChange: (url: string) => void;
  onLastPageUrlChange: (url: string) => void;
}

const DoubleRangeSlider: React.FC<DoubleRangeSliderProps> = ({
  min,
  max,
  step = 1,
  file,
  onFirstPageUrlChange,
  onLastPageUrlChange,
}) => {
  const [value, setValue] = useState<[number, number]>([min, max]);
  const [lastPageOldPosition, setLastPageOldPosition] = useState<number>(
    value[1]
  );
  const [isSinglePage, setIsSinglePage] = useState(false);
  const { createSubFile, getCachedPage } = usePdf();

  useEffect(() => {
    // Call handleChangeCommitted when the component mounts to display the first and last pages
    handleChangeCommitted(null, [min, max]);
  }, []);

  const handleChange = (event: Event, newValue: number | number[]) => {
    let newValues: [number, number] = Array.isArray(newValue)
      ? [newValue[0], newValue[1]]
      : [newValue, newValue];

    if (isSinglePage) {
      const singleValue = newValues[1] > value[0] ? newValues[1] : newValues[0];
      newValues = [singleValue, singleValue];
    } else {
      newValues =
        newValues[0] > newValues[1] ? [newValues[1], newValues[0]] : newValues;
    }
    setValue(newValues);
  };

  const handleChangeCommitted = async (
    event: React.SyntheticEvent | Event | null,
    newValue: number | number[]
  ) => {
    const [start, end] = Array.isArray(newValue)
      ? newValue
      : [newValue, newValue];
    const firstUrl = await getCachedPage(file, start);
    const lastUrl = isSinglePage ? "" : await getCachedPage(file, end);
    onFirstPageUrlChange(firstUrl);
    onLastPageUrlChange(lastUrl);
  };

  const handleCheckboxChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked;
    setIsSinglePage(isChecked);

    if (isChecked) {
      setLastPageOldPosition(value[1]); // Store the current second slider position
      const newValue: [number, number] = [value[0], value[0]];
      setValue(newValue);
      await handleChangeCommitted(event, [newValue[0], newValue[0]]); // Trigger handleChangeCommitted for the first page

      onLastPageUrlChange(""); // Clear the last page URL
    } else {
      const newValue: [number, number] = [value[0], lastPageOldPosition];
      setValue(newValue);
      await handleChangeCommitted(event, [newValue[0], newValue[0]]); // Trigger handleChangeCommitted for the first page
      await handleChangeCommitted(event, [newValue[1], newValue[1]]); // Trigger handleChangeCommitted for the last page
    }
  };

  const handleFirstPageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseInt(event.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= value[1]) {
      setValue([newValue, value[1]]);
    }
    await handleChangeCommitted(null, [value[0], value[1]]);
  };

  const handleLastPageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseInt(event.target.value);
    if (!isNaN(newValue) && newValue >= value[0] && newValue <= max) {
      setValue([value[0], newValue]);
    }
    await handleChangeCommitted(null, [value[0], value[1]]);
  };

  const handleFirstPageIncrement = async () => {
    if (isSinglePage) {
      const newValue: [number, number] = [value[0] + 1, value[0] + 1];
      setValue(newValue);
      await handleChangeCommitted(null, newValue);
    } else if (value[0] < value[1]) {
      const newValue: [number, number] = [value[0] + 1, value[1]];
      setValue(newValue);
      await handleChangeCommitted(null, newValue);
    }
  };

  const handleFirstPageDecrement = async () => {
    if (value[0] > min) {
      const newValue: [number, number] = [value[0] - 1, value[1]];
      setValue(newValue);
      await handleChangeCommitted(null, newValue);
    }
  };

  const handleLastPageIncrement = async () => {
    if (value[1] < max) {
      const newValue: [number, number] = [value[0], value[1] + 1];
      setValue(newValue);
      await handleChangeCommitted(null, newValue);
    }
  };

  const handleLastPageDecrement = async () => {
    if (value[1] > value[0]) {
      const newValue: [number, number] = [value[0], value[1] - 1];
      setValue(newValue);
      await handleChangeCommitted(null, newValue);
    }
  };

  const handleSplit = async () => {
    console.log(value);
    const subFileCreated = await createSubFile(file.id as number, value);

    if (subFileCreated) {
      toast("Subfile created", {
        icon: <Check size={24} color="green" />,
        description: `${file.title} ${
          value[0] === value[1]
            ? `page ${value[0]}`
            : `pages ${value[0]} - ${value[1]}`
        }`,
      });
    } else {
      toast("Subfile already exists", {
        icon: <X size={24} color="red" />,
        description: `A subfile with the range ${value[0]} - ${value[1]} already exists for ${file.title}`,
      });
    }
  };

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox checked={isSinglePage} onChange={handleCheckboxChange} />
        }
        label="Single Page"
      />
      <Box display="flex" alignItems="center">
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton
            className="right-1"
            size="small"
            onClick={handleFirstPageIncrement}
            disabled={value[0] === max}
          >
            <ArrowDropUp />
          </IconButton>
          <TextField
            className="text-center"
            type="number"
            value={value[0]}
            onChange={handleFirstPageChange}
            variant="standard"
            InputProps={{
              style: { fontSize: "0.8rem" },
              disableUnderline: true,
            }}
          />
          <IconButton
            className="right-1"
            size="small"
            onClick={handleFirstPageDecrement}
            disabled={value[0] === min}
          >
            <ArrowDropDown />
          </IconButton>
        </Box>
        <Slider
          value={value}
          onChange={handleChange}
          onChangeCommitted={handleChangeCommitted}
          valueLabelDisplay="auto"
          min={min}
          max={max}
          step={step}
          marks
        />
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton
            className="left-3"
            size="small"
            onClick={handleLastPageIncrement}
            disabled={value[1] === max || isSinglePage}
          >
            <ArrowDropUp />
          </IconButton>
          <TextField
            className="text-center left-3"
            type="number"
            value={value[1]}
            onChange={handleLastPageChange}
            disabled={isSinglePage}
            variant="standard"
            InputProps={{
              style: { fontSize: "0.8rem" },
              disableUnderline: true,
            }}
          />
          <IconButton
            className="left-3"
            size="small"
            onClick={handleLastPageDecrement}
            disabled={value[1] === value[0] || isSinglePage}
          >
            <ArrowDropDown />
          </IconButton>
        </Box>
      </Box>
      <Button onClick={handleSplit}>Split</Button>
    </Box>
  );
};

export default DoubleRangeSlider;
