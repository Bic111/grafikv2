const Legend = () => {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-blue-600"></span>
        <span className="text-xs">Poranna</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-green-600"></span>
        <span className="text-xs">Popołudniowa</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="w-3 h-3 rounded-full bg-purple-600"></span>
        <span className="text-xs">Weekend</span>
      </div>
    </div>
  );
};

export default Legend;
