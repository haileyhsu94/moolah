import React, { useState, useRef, useEffect } from 'react';
import { Settings, BarChart3 } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ExpenseInput } from './components/ExpenseInput';
import { ReportsModal } from './components/ReportsModal';
import { SettingsModal } from './components/SettingsModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { LoginForm } from './components/LoginForm';
import { useExpenses } from './hooks/useExpenses';
import { useAuth } from './hooks/useAuth';
import { Expense } from './types';
import { getTranslation, formatCurrency, currencies } from './utils/translations';

function App() {
  const { user, isAuthenticated, isLoading: authLoading, error: authError, login, register, logout, updateUser, googleLogin } = useAuth();
  const { 
    expenses, 
    messages, 
    settings, 
    addExpense, 
    clearAllData, 
    updateSettings,
    addCustomTag,
    removeCustomTag,
    updateExpense,
    deleteExpense
  } = useExpenses();
  
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNoEntryAlert, setShowNoEntryAlert] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update user name in settings when user logs in
  useEffect(() => {
    if (user && (!settings.userName || settings.userName === 'Friend')) {
      updateSettings({ userName: user.name });
    }
  }, [user, settings.userName, updateSettings]);

  // Check for no entry in last 12 hours
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!expenses.length) {
      setShowNoEntryAlert(true);
      return;
    }
    const latest = Math.max(...expenses.map(e => e.timestamp));
    const now = Date.now();
    if (now - latest > 12 * 60 * 60 * 1000) {
      setShowNoEntryAlert(true);
    } else {
      setShowNoEntryAlert(false);
    }
  }, [expenses, isAuthenticated]);

  const handleExpenseSubmit = async (input: string) => {
    setIsProcessing(true);
    const success = addExpense(input);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  const handleEditExpense = (expenseId: string) => {
    const expense = expenses.find(exp => exp.id === expenseId);
    if (expense) {
      setSelectedExpense(expense);
      setShowEditExpense(true);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId);
  };

  const handleUpdateExpense = (expenseId: string, updates: Partial<Expense>) => {
    updateExpense(expenseId, updates);
  };

  const handleLogout = () => {
    logout();
    clearAllData();
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="h-screen vintage-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Moolah Logo" className="w-full h-full object-contain rounded-[10px]" />
          </div>
          <p className="vintage-text-primary font-bold text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={login}
        onRegister={register}
        isLoading={authLoading}
        error={authError}
        onGoogleLogin={googleLogin}
      />
    );
  }

  // Calculate today's expenses only
  const today = new Date();
  const todayExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date + 'T00:00:00');
    return expDate.getFullYear() === today.getFullYear() &&
           expDate.getMonth() === today.getMonth() &&
           expDate.getDate() === today.getDate();
  });
  const totalSpent = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currencyInfo = currencies[settings.currency];

  return (
    <div className="h-screen vintage-bg-primary flex flex-col">
      {showNoEntryAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 neo-card border-4 border-yellow-400 bg-yellow-100 text-yellow-900 px-6 py-4 flex items-center gap-4 shadow-lg rounded-[10px] font-bold text-base retro-hover animate-bounce-in">
          <span role="img" aria-label="reminder">⏰</span>
          <span>
            {settings.language === 'ja'
              ? '12時間以上記録がありません。支出を記録しましょう！'
              : settings.language === 'zh'
                ? '您已超過12小時未記錄支出，快來記一筆吧！'
                : "No expenses recorded in the last 12 hours. Don't forget to log your spending!"}
          </span>
          <button
            onClick={() => setShowNoEntryAlert(false)}
            className="neo-button neo-button-yellow px-3 py-1 ml-2 rounded-[10px] font-bold retro-hover"
          >
            {settings.language === 'ja' ? '閉じる' : settings.language === 'zh' ? '關閉' : 'Dismiss'}
          </button>
        </div>
      )}
      {/* Header */}
      <header className="vintage-card poster-style">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <img src="/logo.png" alt="Moolah Logo" className="w-full h-full object-contain rounded-[10px]" />
              </div>
              <div>
                <h1 className="font-black text-xl sm:text-2xl vintage-text-primary japanese-text tracking-tight">
                  {getTranslation('appTitle', settings.language)}
                </h1>
                <p className="text-xs sm:text-sm vintage-text-secondary font-bold">
                  {getTranslation('totalSpent', settings.language)}: 
                  <span className="font-black text-sm sm:text-lg ml-2 retro-accent">
                    {formatCurrency(totalSpent, settings.currency, currencyInfo.rate)}
                  </span>
                  {settings.currency !== 'USD' && (
                    <span className="text-xs ml-2 vintage-text-muted">
                      (${totalSpent.toFixed(2)} USD)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User Info - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-3 mr-2">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-[10px] object-cover border-3 border-black"
                  />
                ) : (
                  <div className="w-10 h-10 vintage-bg-accent rounded-[10px] flex items-center justify-center vintage-shadow border-3 border-black">
                    <span className="text-stone-50 font-black text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/*
                <div>
                  <p className="text-sm font-bold vintage-text-primary">{user?.name}</p>
                  <p className="text-xs vintage-text-muted font-medium">{user?.email}</p>
                </div>
                */}
              </div>

              <button
                onClick={() => setShowReports(true)}
                className="p-2 sm:p-3 vintage-button rounded-[10px] transition-all duration-150 retro-hover"
                title={getTranslation('reports', settings.language)}
              >
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 sm:p-3 vintage-button rounded-[10px] transition-all duration-150 retro-hover"
                title={getTranslation('settings', settings.language)}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center mb-4">
                  <img src="/logo.png" alt="Moolah Logo" className="w-full h-full object-contain rounded-[10px]" />
                </div>
                <div className="vintage-card p-6 sm:p-8 rounded-[10px] max-w-md mx-auto poster-style">
                  <h2 className="text-xl sm:text-2xl font-black vintage-text-primary mb-4 japanese-text retro-accent">
                    {getTranslation('welcome', settings.language)}
                  </h2>
                  <p className="vintage-text-secondary leading-relaxed font-medium text-sm sm:text-base">
                    {getTranslation('welcomeDesc', settings.language)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  settings={settings}
                  onEditExpense={handleEditExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              ))}
              {isProcessing && (
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] vintage-bg-accent flex items-center justify-center vintage-shadow border-3 border-black">
                    {settings.avatar && settings.avatar !== '/api/placeholder/40/40' ? (
                      <img 
                        src={settings.avatar} 
                        alt={settings.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-stone-100 rounded-[10px] vintage-pulse"></div>
                    )}
                  </div>
                  <div className="vintage-card px-4 py-3 sm:px-6 sm:py-4 rounded-[10px] vintage-shadow">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-700 rounded-[10px] animate-bounce"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-800 rounded-[10px] animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-slate-700 rounded-[10px] animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ExpenseInput 
          onSubmit={handleExpenseSubmit} 
          disabled={isProcessing}
          settings={settings}
        />
      </div>

      {/* Modals */}
      <ReportsModal 
        isOpen={showReports}
        onClose={() => setShowReports(false)}
        expenses={expenses}
        settings={settings}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onClearData={clearAllData}
        onAddCustomTag={addCustomTag}
        onRemoveCustomTag={removeCustomTag}
        onLogout={handleLogout}
        user={user}
        onUpdateUser={updateUser}
      />

      <EditExpenseModal
        isOpen={showEditExpense}
        onClose={() => {
          setShowEditExpense(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
        customTags={settings.customTags}
        settings={settings}
      />
    </div>
  );
}

export default App;