import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

interface BreakCalendarProps {
  breakDates: Date[];
}

export const BreakCalendar = ({ breakDates }: BreakCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Break Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{
            hasBreak: breakDates,
          }}
          modifiersClassNames={{
            hasBreak: 'bg-primary/20 font-bold',
          }}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
};
