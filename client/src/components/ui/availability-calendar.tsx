
import { Calendar } from "./calendar";
import { Badge } from "./badge";
import { useState } from "react";

export function AvailabilityCalendar({ 
  bookedDates,
  onDateSelect 
}: { 
  bookedDates: Date[];
  onDateSelect: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <div className="p-4 border rounded-lg">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          setSelectedDate(date);
          date && onDateSelect(date);
        }}
        disabled={bookedDates}
      />
      <div className="mt-4 flex gap-2">
        <Badge variant="outline">Available</Badge>
        <Badge variant="secondary">Booked</Badge>
      </div>
    </div>
  );
}
