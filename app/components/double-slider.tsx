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

}

const DoubleRangeSlider: React.FC<DoubleRangeSliderProps> = ({ min, max, step = 1, file }) => {
  const [value, setValue] = useState<[number, number]>([min, max]);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [firstPageUrl, setFirstPageUrl] = useState('')
  const [lastPageUrl, setLastPageUrl] = useState('')
  const { createSubFile } = usePdf();

  const handleChange = (event: Event, newValue: number | number[]) => {
    // Handle changes with the assumption that newValue is always an array for our component
    let newValues: [number, number] = Array.isArray(newValue) ? [newValue[0], newValue[1]] : [newValue, newValue];
    
    if (isSinglePage) {
      // In 'Single Page' mode, set both values to either the first or second value of newValues, 
      // depending on the direction of change
      const singleValue = newValues[1] > value[0] ? newValues[1] : newValues[0];
      newValues = [singleValue, singleValue];
    } else {
      // Adjust if values are inverted for normal range selection
      newValues = newValues[0] > newValues[1] ? [newValues[1], newValues[0]] : newValues;
    }
    setFirstPageUrl(await getPage(file, value[0]));
    setValue(newValues);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSinglePage(event.target.checked);
    if (event.target.checked) {
      // Ensure 'Single Page' mode starts with the lower value for consistency
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
        valueLabelDisplay="auto" // Always display value labels
        min={min}
        max={max}
        step={step}
        marks // Adds marks at each step for clearer distinction
      />
      <Button onClick={handleSplit}>Split</Button>
    </Box>
  );
};

export default DoubleRangeSlider;
