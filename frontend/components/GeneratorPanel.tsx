"use client";
import { useState } from "react";

type GeneratorPanelProps = {
  onGenerate: (year: number, month: number, generatorType: string, scenarioType?: string) => void;
};

const GeneratorPanel = ({ onGenerate }: GeneratorPanelProps) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [generatorType, setGeneratorType] = useState<string>('heuristic');
  const [scenarioType, setScenarioType] = useState<string>('balanced');

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, name: 'Styczeń' }, { value: 2, name: 'Luty' },
    { value: 3, name: 'Marzec' }, { value: 4, name: 'Kwiecień' },
    { value: 5, name: 'Maj' }, { value: 6, name: 'Czerwiec' },
    { value: 7, name: 'Lipiec' }, { value: 8, name: 'Sierpień' },
    { value: 9, name: 'Wrzesień' }, { value: 10, name: 'Październik' },
    { value: 11, name: 'Listopad' }, { value: 12, name: 'Grudzień' },
  ];

  const handleGenerateClick = () => {
    onGenerate(selectedYear, selectedMonth, generatorType, generatorType === 'ortools' ? scenarioType : undefined);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-3">Generator Grafiku</h3>
      
      <div className="flex flex-wrap items-end gap-4">
        {/* Year and Month Selection */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
          >
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
          >
            {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
          </select>
        </div>

        {/* Generator Type Selection */}
        <div className="flex items-center space-x-3 bg-gray-700 rounded-md px-3 py-2 border border-gray-600">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="heuristic"
              checked={generatorType === 'heuristic'}
              onChange={(e) => setGeneratorType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-white">Heurystyczny</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              value="ortools"
              checked={generatorType === 'ortools'}
              onChange={(e) => setGeneratorType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-white">OR-Tools</span>
          </label>
        </div>

        {/* Scenario Selection (only for OR-Tools) */}
        {generatorType === 'ortools' && (
          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="balanced">Zbalansowany</option>
            <option value="minimize_work">Minimalizuj pracę</option>
            <option value="maximize_coverage">Maksymalizuj pokrycie</option>
          </select>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
        >
          Generuj Grafik
        </button>
      </div>
    </div>
  );
};

export default GeneratorPanel;
