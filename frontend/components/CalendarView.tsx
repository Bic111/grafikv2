// Definicje typów, aby komponent wiedział, jakich danych oczekiwać
type Shift = {
  id: number;
  nazwa_zmiany: string;
  godzina_rozpoczecia?: string | null;
};

type ScheduleEntry = {
  id: number;
  pracownik: {
    imie: string | null;
    nazwisko: string | null;
  } | null;
  // Opcjonalne flagi wizualne
  isLead?: boolean; // Osoba prowadząca zmianę
  validationError?: boolean; // Błąd walidacji dla wpisu
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
  shiftParams?: {
    dzien_tygodnia: number;
    typ_zmiany: string;
    godzina_od: string; // HH:MM
    godzina_do: string; // HH:MM
  }[];
};

// Kolory zgodne z legendą: Rano (blue), Środek (amber), Popołudnie (green)
const getShiftColorFromType = (typ: string) => {
  const t = typ.toLowerCase();
  if (t.includes('rano')) return 'bg-blue-600 hover:bg-blue-700';
  if (t.includes('środek') || t.includes('srodek')) return 'bg-amber-500 hover:bg-amber-600';
  if (t.includes('popoł') || t.includes('popol')) return 'bg-green-600 hover:bg-green-700';
  return 'bg-gray-600 hover:bg-gray-700';
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map((s) => parseInt(s, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

const parseStartMinutes = (timeStr?: string | null): number | null => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h ?? '', 10);
  const min = parseInt(m ?? '0', 10);
  if (!Number.isFinite(hour)) return null;
  return hour * 60 + (Number.isFinite(min) ? min : 0);
};

const toMondayZero = (d: Date) => (d.getDay() + 6) % 7; // 0=Mon..6=Sun

const getShiftColor = (
  dateStr: string,
  shift: Shift,
  params: NonNullable<CalendarViewProps['shiftParams']>
) => {
  const startMin = parseStartMinutes(shift.godzina_rozpoczecia ?? null);
  const dayIdx = toMondayZero(new Date(dateStr));
  if (startMin !== null && params && params.length > 0) {
    const match = params.find(
      (p) => p.dzien_tygodnia === dayIdx && startMin >= toMinutes(p.godzina_od) && startMin < toMinutes(p.godzina_do)
    );
    if (match) return getShiftColorFromType(match.typ_zmiany);
  }
  // Brak dopasowania w konfiguracji → neutralny kolor, aby ujawnić brak mapowania
  return 'bg-gray-600 hover:bg-gray-700';
};

const CalendarView = ({ scheduleData, onDrop, onDragStart, onDragEnd, shiftParams = [] }: CalendarViewProps) => {
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
                        className={`text-xs text-white p-1 rounded-md cursor-move ${
                          entry?.validationError
                            ? 'bg-red-600 hover:bg-red-700'
                            : entry?.isLead
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : getShiftColor(day.date, shift, shiftParams)
                        }`}
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
