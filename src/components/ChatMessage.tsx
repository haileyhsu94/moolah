import React, { useState } from 'react';
import { ChatMessage as ChatMessageType, ChatbotSettings } from '../types';
import { User, Bot, Tag, Edit3, Trash2 } from 'lucide-react';
import { formatCurrency, currencies } from '../utils/translations';

interface ChatMessageProps {
  message: ChatMessageType;
  settings: ChatbotSettings;
  onEditExpense?: (expenseId: string) => void;
  onDeleteExpense?: (expenseId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  settings, 
  onEditExpense, 
  onDeleteExpense 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isBot = message.type === 'bot';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const hasExpense = message.expense && message.type === 'user';
  const currencyInfo = currencies[settings.currency];

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message.expense && onEditExpense) {
      onEditExpense(message.expense.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message.expense && onDeleteExpense) {
      onDeleteExpense(message.expense.id);
    }
  };

  return (
    <div 
      className={`flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6 ${isBot ? '' : 'flex-row-reverse'} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] flex items-center justify-center vintage-shadow border-3 border-black ${
        isBot ? 'vintage-bg-accent' : 'bg-stone-600'
      }`}>
        {isBot ? (
          settings.avatar && settings.avatar !== '/api/placeholder/40/40' ? (
            <img 
              src={settings.avatar} 
              alt={settings.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] object-cover"
            />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-stone-100" />
          )
        ) : (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
      </div>
      
      <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isBot ? 'items-start' : 'items-end'} relative`}>
        <div className={`px-4 py-3 sm:px-6 sm:py-4 rounded-[10px] vintage-shadow relative border-3 border-black ${
          isBot 
            ? 'vintage-card vintage-text-primary bg-white' 
            : 'bg-stone-600 text-white'
        }`}>
          <p className="text-sm leading-relaxed font-medium">{message.content}</p>
          {message.expense && (
            <div className={`mt-3 pt-3 text-xs border-t-2 ${
              isBot ? 'border-black' : 'border-stone-400'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-base sm:text-lg">
                  {formatCurrency(message.expense.amount, settings.currency, currencyInfo.rate)}
                </span>
                <span className={`capitalize font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-[10px] text-xs border-2 border-black ${
                  isBot 
                    ? 'bg-blue-400 text-black' 
                    : 'bg-stone-200 text-stone-800'
                }`}>
                  {message.expense.category}
                </span>
              </div>
              {settings.currency !== 'USD' && (
                <div className="text-xs opacity-75 mb-2 font-medium">
                  ${message.expense.amount.toFixed(2)} USD
                </div>
              )}
              {message.expense.tags && message.expense.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 opacity-60" />
                  {message.expense.tags.map((tag, index) => (
                    <span key={index} className={`text-xs px-2 py-1 sm:px-3 sm:py-1 rounded-[10px] font-bold border-2 border-black ${
                      isBot 
                        ? 'bg-yellow-400 text-black' 
                        : 'bg-stone-100 text-stone-800'
                    }`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {hasExpense && (isHovered || window.innerWidth <= 768) && (
            <div className={`absolute top-2 sm:top-3 ${isBot ? 'right-2 sm:right-3' : 'left-2 sm:left-3'} flex gap-1 sm:gap-2`}>
              <button
                onClick={handleEditClick}
                className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 hover:bg-yellow-500 rounded-[10px] flex items-center justify-center transition-all duration-150 border-2 border-black neo-button"
                title="Edit expense"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 rounded-[10px] flex items-center justify-center transition-all duration-150 border-2 border-black neo-button"
                title="Delete expense"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>
          )}
        </div>
        <span className="text-xs vintage-text-muted mt-2 px-3 font-bold">{time}</span>
      </div>
    </div>
  );
};