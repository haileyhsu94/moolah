import React, { useState } from 'react';
import { X, Calculator, Delete, Plus, Minus, X as Multiply, Divide } from 'lucide-react';
import { ChatbotSettings } from '../types';
import { getTranslation, formatCurrency, currencies } from '../utils/translations';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (value: string) => void;
  settings: ChatbotSettings;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose, onInsert, settings }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleInsert = () => {
    const value = parseFloat(display);
    if (!isNaN(value) && value > 0) {
      onInsert(value.toFixed(2));
      onClose();
      clear();
    }
  };

  const handleClose = () => {
    clear();
    onClose();
  };

  if (!isOpen) return null;

  const currencyInfo = currencies[settings.currency];
  const convertedAmount = parseFloat(display) * currencyInfo.rate;

  const buttonClass = "h-14 rounded-xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 vintage-shadow retro-hover";
  const numberButtonClass = `${buttonClass} vintage-card vintage-text-primary hover:bg-stone-200`;
  const operatorButtonClass = `${buttonClass} vintage-button text-white`;
  const specialButtonClass = `${buttonClass} vintage-button-secondary text-stone-50`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="vintage-card rounded-3xl w-full max-w-sm vintage-shadow paper-texture poster-style">
        <div className="flex items-center justify-between p-6 border-b-2 border-red-300">
          <h2 className="text-xl font-bold vintage-text-primary flex items-center gap-3 japanese-text">
            <Calculator className="w-6 h-6 text-red-700" />
            {getTranslation('modals.calculator', settings.language)}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 vintage-text-primary" />
          </button>
        </div>

        <div className="p-6">
          {/* Display */}
          <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-stone-100 p-6 rounded-2xl mb-6 text-right vintage-shadow">
            <div className="text-3xl font-mono font-bold overflow-hidden">{display}</div>
            <div className="text-sm opacity-75 mt-1">
              {formatCurrency(parseFloat(display), settings.currency, currencyInfo.rate)}
            </div>
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <button onClick={clear} className={`${specialButtonClass} col-span-2`}>
              Clear
            </button>
            <button onClick={() => setDisplay(display.slice(0, -1) || '0')} className={specialButtonClass}>
              <Delete className="w-5 h-5 mx-auto" />
            </button>
            <button onClick={() => performOperation('/')} className={operatorButtonClass}>
              <Divide className="w-5 h-5 mx-auto" />
            </button>

            {/* Row 2 */}
            <button onClick={() => inputNumber('7')} className={numberButtonClass}>7</button>
            <button onClick={() => inputNumber('8')} className={numberButtonClass}>8</button>
            <button onClick={() => inputNumber('9')} className={numberButtonClass}>9</button>
            <button onClick={() => performOperation('*')} className={operatorButtonClass}>
              <Multiply className="w-5 h-5 mx-auto" />
            </button>

            {/* Row 3 */}
            <button onClick={() => inputNumber('4')} className={numberButtonClass}>4</button>
            <button onClick={() => inputNumber('5')} className={numberButtonClass}>5</button>
            <button onClick={() => inputNumber('6')} className={numberButtonClass}>6</button>
            <button onClick={() => performOperation('-')} className={operatorButtonClass}>
              <Minus className="w-5 h-5 mx-auto" />
            </button>

            {/* Row 4 */}
            <button onClick={() => inputNumber('1')} className={numberButtonClass}>1</button>
            <button onClick={() => inputNumber('2')} className={numberButtonClass}>2</button>
            <button onClick={() => inputNumber('3')} className={numberButtonClass}>3</button>
            <button onClick={() => performOperation('+')} className={operatorButtonClass}>
              <Plus className="w-5 h-5 mx-auto" />
            </button>

            {/* Row 5 */}
            <button onClick={() => inputNumber('0')} className={`${numberButtonClass} col-span-2`}>0</button>
            <button onClick={inputDecimal} className={numberButtonClass}>.</button>
            <button onClick={handleEquals} className={operatorButtonClass}>=</button>
          </div>

          {/* Insert Button */}
          <button
            onClick={handleInsert}
            disabled={parseFloat(display) <= 0 || isNaN(parseFloat(display))}
            className="w-full mt-6 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all duration-300 vintage-shadow retro-hover"
          >
            {settings.language === 'ja' ? '挿入' : settings.language === 'en' ? 'Insert' : '挿入 / Insert'} {formatCurrency(parseFloat(display), settings.currency, currencyInfo.rate)}
          </button>
        </div>
      </div>
    </div>
  );
};