import React, { useState } from 'react';
import { Slider, Box, Checkbox, FormControlLabel } from '@mui/material';
import { Button } from './ui/button';
import { usePdf } from "app/contexts/pdf-context"; 
import { getPage } from '~/lib/get-page';
import { PdfFile } from '~/contexts/types/pdf';

interface DoubleRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  file: PdfFile;
  onFirstPageUrlChange: (url: string) => void;
  onLastPageUrlChange: (url: string) => void;
}

const DoubleRangeSlider: React.FC<DoubleRangeSliderProps> = ({ min, max, step = 1, file, onFirstPageUrlChange, onLastPageUrlChange }) => {
  const [value, setValue] = useState<[number, number]>([min, max]);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const { createSubFile } = usePdf();

  const handleChange = (event: Event, newValue: number | number[]) => {
    let newValues: [number, number] = Array.isArray(newValue) ? [newValue[0], newValue[1]] : [newValue, newValue];
    
    if (isSinglePage) {
      const singleValue = newValues[1] > value[0] ? newValues[1] : newValues[0];
      newValues = [singleValue, singleValue];
    } else {
      newValues = newValues[0] > newValues[1] ? [newValues[1], newValues[0]] : newValues;
    }
    setValue(newValues);
  };

  const handleChangeCommitted = async (event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    const [start, end] = Array.isArray(newValue) ? newValue : [newValue, newValue];
    const firstUrl = await getPage(file, start);
    const lastUrl = await getPage(file, end);
    onFirstPageUrlChange(firstUrl);
    onLastPageUrlChange(lastUrl);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSinglePage(event.target.checked);
    if (event.target.checked) {
      setValue([value[0], value[0]]);
    }
  };

  const handleSplit = () => {
    console.log(value);
    createSubFile(file.id as number, value);
  };

  return (
    <Box>
      <FormControlLabel
        control={<Checkbox checked={isSinglePage} onChange={handleCheckboxChange} />}
        label="Single Page"
      />
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
      <Button onClick={handleSplit}>Split</Button>
    </Box>
  );
};

export default DoubleRangeSlider;