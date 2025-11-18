const Legend = () => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-blue-600" aria-hidden="true"></span>
        <span className="text-xs">Rano</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-amber-500" aria-hidden="true"></span>
        <span className="text-xs">Środek</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-green-600" aria-hidden="true"></span>
        <span className="text-xs">Popołudnie</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-sm bg-orange-500" aria-hidden="true"></span>
        <span className="text-xs">Osoba prowadząca zmianę</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-red-600" aria-hidden="true"></span>
        <span className="text-xs">Błąd walidacji</span>
      </div>
    </div>
  );
};

export default Legend;
