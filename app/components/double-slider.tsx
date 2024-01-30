import React, { useState } from "react";

type DoubleRangeSliderProps = {
  min: number;
  max: number;
  onChange: (range: { lower: number; upper: number }) => void;
};

const DoubleRangeSlider: React.FC<DoubleRangeSliderProps> = ({ min, max, onChange }) => {
  const [lowerValue, setLowerValue] = useState(min);
  const [upperValue, setUpperValue] = useState(max);

  const handleLowerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(Number(e.target.value), upperValue - 1);
    setLowerValue(newValue);
    onChange({ lower: newValue, upper: upperValue });
  };

  const handleUpperInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(Number(e.target.value), lowerValue + 1);
    setUpperValue(newValue);
    onChange({ lower: lowerValue, upper: newValue });
  };

  return (
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={lowerValue}
        onChange={handleLowerInputChange}
        className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={upperValue}
        onChange={handleUpperInputChange}
        className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};

export default DoubleRangeSlider;
