import React, { useState } from 'react';
import { Send, Camera, Calculator } from 'lucide-react';
import { ReceiptScanner } from './ReceiptScanner';
import { CalculatorModal } from './CalculatorModal';
import { ChatbotSettings } from '../types';
import { getTranslation } from '../utils/translations';

interface ExpenseInputProps {
  onSubmit: (input: string) => void;
  disabled?: boolean;
  settings: ChatbotSettings;
}

export const ExpenseInput: React.FC<ExpenseInputProps> = ({ onSubmit, disabled, settings }) => {
  const [input, setInput] = useState('');
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleReceiptScanned = (expense: { amount: number; description: string; category: string }) => {
    const currencySymbol = settings.currency === 'JPY' ? '¥' : '$';
    const amount = settings.currency === 'JPY' ? Math.round(expense.amount * 150) : expense.amount;
    const expenseText = settings.language === 'ja' 
      ? `${expense.description}に${currencySymbol}${amount}使いました`
      : `I spent ${currencySymbol}${amount} on ${expense.description}`;
    setInput(expenseText);
    setShowReceiptScanner(false);
  };

  const handleCalculatorInsert = (value: string) => {
    const currentInput = input;
    const cursorPosition = (document.activeElement as HTMLInputElement)?.selectionStart || currentInput.length;
    
    const currencySymbol = settings.currency === 'JPY' ? '¥' : '$';
    const amount = settings.currency === 'JPY' ? Math.round(parseFloat(value) * 150) : parseFloat(value);
    
    const dollarMatch = currentInput.match(/[\$¥]\d+\.?\d*/);
    if (dollarMatch) {
      const newInput = currentInput.replace(/[\$¥]\d+\.?\d*/, `${currencySymbol}${amount}`);
      setInput(newInput);
    } else {
      const newInput = currentInput.slice(0, cursorPosition) + `${currencySymbol}${amount}` + currentInput.slice(cursorPosition);
      setInput(newInput);
    }
  };

  return (
    <>
      <div className="vintage-card poster-style">
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getTranslation('placeholder', settings.language)}
              className="flex-1 px-4 py-3 sm:px-6 sm:py-4 vintage-input rounded-[10px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-lg"
              disabled={disabled}
            />
            
            <button
              type="button"
              onClick={() => setShowCalculator(true)}
              disabled={disabled}
              className="w-12 h-12 sm:w-14 sm:h-14 neo-button neo-button-yellow rounded-[10px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title={getTranslation('buttons.calculator', settings.language)}
            >
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <button
              type="button"
              onClick={() => setShowReceiptScanner(true)}
              disabled={disabled}
              className="w-12 h-12 sm:w-14 sm:h-14 neo-button neo-button-green rounded-[10px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title={getTranslation('buttons.camera', settings.language)}
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className="w-12 h-12 sm:w-14 sm:h-14 vintage-button rounded-[10px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              title={getTranslation('buttons.send', settings.language)}
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </form>
        </div>
      </div>

      <CalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        onInsert={handleCalculatorInsert}
        settings={settings}
      />

      <ReceiptScanner
        isOpen={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
        onExpenseExtracted={handleReceiptScanned}
        settings={settings}
      />
    </>
  );
};