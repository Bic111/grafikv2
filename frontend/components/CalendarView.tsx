// Definicje typów, aby komponent wiedział, jakich danych oczekiwać
type Shift = {
  id: number;
  nazwa_zmiany: string;
};

type ScheduleEntry = {
  id: number;
  pracownik: {
    imie: string | null;
    nazwisko: string | null;
  } | null;
};

type DayData = {
  date: string;
  shifts: {
    shift: Shift;
    entries: ScheduleEntry[];
  }[];
};

type CalendarViewProps = {
  scheduleData: DayData[];
  onDrop: (date: string, shiftId: number) => void;
  onDragStart: (entryId: number) => void;
  onDragEnd: () => void;
};

// Funkcja do mapowania nazw zmian na kolory Tailwind CSS
const getShiftColor = (shiftName: string) => {
  switch (shiftName.toLowerCase()) {
    case 'poranna':
      return 'bg-blue-600 hover:bg-blue-700';
    case 'popołudniowa':
      return 'bg-green-600 hover:bg-green-700';
    case 'weekend':
      return 'bg-purple-600 hover:bg-purple-700';
    default:
      return 'bg-gray-600 hover:bg-gray-700';
  }
};

const CalendarView = ({ scheduleData, onDrop, onDragStart, onDragEnd }: CalendarViewProps) => {
  if (!scheduleData || scheduleData.length === 0) {
    return <div className="flex-1 p-4 text-center">Brak danych do wyświetlenia grafiku.</div>;
  }

  // Tworzymy pełny miesiąc, w tym puste komórki
  const firstDay = new Date(scheduleData[0].date);
  const month = firstDay.getMonth();
  const year = firstDay.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // 0=Pon, 6=Nie
  
  const calendarDays = Array.from({ length: firstDayOfWeek }, () => null);
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayData = scheduleData.find(d => d.date === dateStr);
    calendarDays.push(dayData || { date: dateStr, shifts: [] });
  }

  const daysOfWeek = ['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'];

  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase pb-2">{day}</div>
        ))}
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={`border border-gray-700 rounded-md min-h-[120px] p-1 bg-gray-800 ${!day ? 'opacity-50' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            // Wstępnie upuszczamy na cały dzień, logikę dla konkretnej zmiany trzeba będzie dodać
            onDrop={(e) => {
              e.preventDefault();
              // Uproszczone onDrop - docelowo potrzebuje ID zmiany
              if (day && day.shifts.length > 0) {
                onDrop(day.date, day.shifts[0].shift.id); 
              }
            }}
          >
            {day && (
              <>
                <span className="font-semibold text-sm pl-1">{new Date(day.date).getDate()}</span>
                <div className="space-y-1 mt-1">
                  {day.shifts.map(({ shift, entries }) => (
                    entries.map(entry => (
                      <div
                        key={entry.id}
                        draggable
                        onDragStart={() => onDragStart(entry.id)}
                        onDragEnd={onDragEnd}
                        className={`text-xs text-white p-1 rounded-md cursor-move ${getShiftColor(shift.nazwa_zmiany)}`}
                      >
                        {entry.pracownik?.imie} {entry.pracownik?.nazwisko?.[0]}.
                      </div>
                    ))
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
