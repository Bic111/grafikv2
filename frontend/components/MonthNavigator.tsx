type MonthNavigatorProps = {
  currentMonth: string; // "YYYY-MM"
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const MonthNavigator = ({ currentMonth, onPrevMonth, onNextMonth }: MonthNavigatorProps) => {
  const date = new Date(`${currentMonth}-02`); // Używamy drugiego dnia, by uniknąć problemów ze strefami czasowymi
  const monthName = date.toLocaleString('pl-PL', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center space-x-4">
      <button onClick={onPrevMonth} className="p-2 rounded-md hover:bg-gray-700">
        &lt;
      </button>
      <h2 className="text-xl font-bold w-48 text-center">{monthName}</h2>
      <button onClick={onNextMonth} className="p-2 rounded-md hover:bg-gray-700">
        &gt;
      </button>
    </div>
  );
};

export default MonthNavigator;
