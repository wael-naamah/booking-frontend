import React from 'react';
import { Button } from 'antd';
import { WeekDay } from "../../../../Schema";

interface WeekdaySelectorProps {
  selectedDays: WeekDay[];
  setSelectedDays: (selectedDays: WeekDay[]) => void;
  disabled?: boolean;
}

const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({ selectedDays, setSelectedDays, disabled = false }) => {

  const handleDayClick = (day: WeekDay) => {
    const updatedSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    setSelectedDays(updatedSelectedDays);
  };

  const handleAllDaysClick = () => {
    const allDays = Object.values(WeekDay);

    if (selectedDays.length === allDays.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(allDays);
    }
  };

  return (
    <div className='mb-4'>
      {Object.values(WeekDay).map((day, index) => (
        <Button
          key={day}
          className= {index === 0 ? "mr-1" : "mx-1"}
          type={selectedDays.includes(day) ? 'primary' : 'default'}
          onClick={() => disabled ? {} : handleDayClick(day)}
        >
          {day}
        </Button>
      ))}
      <Button
        type={selectedDays.length === Object.values(WeekDay).length ? 'primary' : 'default'}
        onClick={() => disabled ? {} : handleAllDaysClick()}
        className="mx-1"
      >
        All Days
      </Button>
    </div>
  );
};

export default WeekdaySelector;
