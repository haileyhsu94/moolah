import React, { useState } from 'react';
import { X, Settings, Upload, User, Tag, Plus, Trash2, Globe, DollarSign, LogOut } from 'lucide-react';
import { ChatbotSettings, User as UserType } from '../types';
import { getTranslation, currencies, languages } from '../utils/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatbotSettings;
  onUpdateSettings: (settings: Partial<ChatbotSettings>) => void;
  onClearData: () => void;
  onAddCustomTag: (tag: string) => void;
  onRemoveCustomTag: (tag: string) => void;
  onLogout: () => void;
  user: UserType | null;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings,
  onClearData,
  onAddCustomTag,
  onRemoveCustomTag,
  onLogout,
  user,
  onUpdateUser
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newTag, setNewTag] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalSettings(prev => ({ ...prev }));
        onUpdateUser({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBotAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalSettings(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearData = () => {
    onClearData();
    setShowClearConfirm(false);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
    onClose();
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddCustomTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onRemoveCustomTag(tag);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="vintage-card rounded-[10px] w-full max-w-md max-h-[90vh] overflow-y-auto vintage-shadow paper-texture poster-style">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-red-300">
          <h2 className="text-lg sm:text-xl font-bold vintage-text-primary flex items-center gap-3 japanese-text">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
            {getTranslation('modals.settings', settings.language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-[10px] transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 vintage-text-primary" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* User Profile Section */}
          <div className="pb-4 border-b-2 border-red-300">
            <h3 className="text-sm font-bold vintage-text-primary mb-3 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Profile
            </h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[10px] bg-stone-200 flex items-center justify-center overflow-hidden border-2 border-red-400 vintage-shadow">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 vintage-text-secondary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold vintage-text-primary text-sm sm:text-base">{user?.name}</p>
                <p className="text-xs sm:text-sm vintage-text-muted">{user?.email}</p>
                <label className="cursor-pointer vintage-button px-3 py-2 rounded-[10px] transition-all duration-300 flex items-center gap-2 retro-hover text-xs sm:text-sm mt-2 inline-flex">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Chatbot Avatar Section */}
          <div className="pb-4 border-b-2 border-red-300">
            <h3 className="text-sm font-bold vintage-text-primary mb-3 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Chatbot Avatar
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[10px] bg-stone-200 flex items-center justify-center overflow-hidden border-2 border-red-400 vintage-shadow">
                {localSettings.avatar ? (
                  <img 
                    src={localSettings.avatar} 
                    alt="Chatbot Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 vintage-text-secondary" />
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer vintage-button px-3 py-2 rounded-[10px] transition-all duration-300 flex items-center gap-2 retro-hover text-xs sm:text-sm mt-2 inline-flex">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  Change Chatbot Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBotAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* UserName for Chatbot Addressing */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3">
              {settings.language === 'ja' ? 'チャットボットが呼ぶあなたの名前' : settings.language === 'en' ? 'How should the chatbot address you?' : 'チャットボットが呼ぶあなたの名前 / How should the chatbot address you?'}
            </label>
            <input
              type="text"
              value={localSettings.userName}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, userName: e.target.value }))}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 vintage-input rounded-[10px] focus:outline-none text-sm sm:text-base"
              placeholder={settings.language === 'ja' ? 'チャットボットが呼ぶ名前を入力' : 'Enter the name you want the chatbot to use'}
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              {settings.language === 'ja' ? '言語' : settings.language === 'en' ? 'Language' : '言語 / Language'}
            </label>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocalSettings(prev => ({ ...prev, language: lang.code }))}
                  className={`p-3 sm:p-4 rounded-[10px] border-2 transition-all duration-300 flex items-center gap-3 text-sm sm:text-base ${
                    localSettings.language === lang.code
                      ? 'vintage-button text-white border-red-600'
                      : 'vintage-card vintage-text-primary border-stone-300 hover:border-red-400'
                  }`}
                >
                  <span className="text-lg sm:text-2xl flag-wave">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              {settings.language === 'ja' ? '通貨' : settings.language === 'en' ? 'Currency' : '通貨 / Currency'}
            </label>
            <select
              value={localSettings.currency}
              onChange={(e) => setLocalSettings(prev => ({ 
                ...prev, 
                currency: e.target.value as ChatbotSettings['currency'],
                exchangeRate: currencies[e.target.value as keyof typeof currencies].rate
              }))}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 vintage-input rounded-[10px] focus:outline-none text-sm sm:text-base"
            >
              {Object.entries(currencies).map(([code, info]) => (
                <option key={code} value={code}>
                  {info.symbol} {info.name} ({code})
                </option>
              ))}
            </select>
          </div>

          {/* Chatbot Name */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3">
              {settings.language === 'ja' ? 'チャットボット名' : settings.language === 'en' ? 'Chatbot Name' : 'チャットボット名 / Chatbot Name'}
            </label>
            <input
              type="text"
              value={localSettings.name}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 vintage-input rounded-[10px] focus:outline-none text-sm sm:text-base"
              placeholder={settings.language === 'ja' ? 'チャットボットの名前を入力' : 'Enter chatbot name'}
            />
          </div>

          {/* Personality */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3">
              {settings.language === 'ja' ? '性格' : settings.language === 'en' ? 'Personality' : '性格 / Personality'}
            </label>
            <select
              value={localSettings.personality}
              onChange={(e) => setLocalSettings(prev => ({ 
                ...prev, 
                personality: e.target.value as ChatbotSettings['personality']
              }))}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 vintage-input rounded-[10px] focus:outline-none text-sm sm:text-base"
            >
              <option value="sarcastic">
                {settings.language === 'ja' ? '皮肉っぽい 😏' : settings.language === 'en' ? 'Sarcastic 😏' : '皮肉っぽい / Sarcastic 😏'}
              </option>
              <option value="encouraging">
                {settings.language === 'ja' ? '励ましてくれる 🌟' : settings.language === 'en' ? 'Encouraging 🌟' : '励ましてくれる / Encouraging 🌟'}
              </option>
              <option value="neutral">
                {settings.language === 'ja' ? '中立的 🤖' : settings.language === 'en' ? 'Neutral 🤖' : '中立的 / Neutral 🤖'}
              </option>
            </select>
          </div>

          {/* Custom Tags */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              {settings.language === 'ja' ? 'カスタムタグ' : settings.language === 'en' ? 'Custom Tags' : 'カスタムタグ / Custom Tags'}
            </label>
            
            <form onSubmit={handleAddTag} className="flex gap-2 sm:gap-3 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={settings.language === 'ja' ? '新しいタグを追加...' : 'Add new tag...'}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 vintage-input rounded-[10px] focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!newTag.trim()}
                className="vintage-button px-3 py-2 sm:px-4 sm:py-3 rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed retro-hover"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>

            <div className="space-y-2 sm:space-y-3 max-h-32 overflow-y-auto">
              {settings.customTags.length > 0 ? (
                settings.customTags.map((tag) => (
                  <div key={tag} className="flex items-center justify-between bg-stone-200 px-3 py-2 sm:px-4 sm:py-3 rounded-[10px] border border-stone-300">
                    <span className="text-sm vintage-text-primary font-medium">#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-700 hover:text-red-900 transition-colors p-1"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm vintage-text-muted italic text-center py-4">
                  {settings.language === 'ja' ? 'まだカスタムタグがありません。' : 'No custom tags yet.'}
                </p>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="pt-4 border-t-2 border-red-300 space-y-4">
            <label className="block text-sm font-bold text-red-800 mb-3">
              {settings.language === 'ja' ? 'アカウント管理' : settings.language === 'en' ? 'Account Management' : 'アカウント管理 / Account Management'}
            </label>
            
            {/* Logout */}
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full vintage-button-secondary px-4 py-3 rounded-[10px] transition-all duration-300 retro-hover flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                {settings.language === 'ja' ? 'ログアウト' : 'Logout'}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-800 font-medium">
                  {settings.language === 'ja' ? 'ログアウトしますか？' : 'Are you sure you want to logout?'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex-1 vintage-button-secondary px-3 py-2 rounded-[10px] text-sm transition-all duration-300 retro-hover"
                  >
                    {settings.language === 'ja' ? 'はい' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 bg-stone-300 vintage-text-primary px-3 py-2 rounded-[10px] text-sm hover:bg-stone-400 transition-colors font-medium"
                  >
                    {getTranslation('buttons.cancel', settings.language)}
                  </button>
                </div>
              </div>
            )}

            {/* Clear Data */}
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-[10px] transition-all duration-300 retro-hover font-bold text-sm sm:text-base"
              >
                {getTranslation('buttons.clear', settings.language)}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-800 font-medium">
                  {settings.language === 'ja' ? '本当によろしいですか？この操作は元に戻せません。' : 'Are you sure? This action cannot be undone.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearData}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-[10px] text-sm transition-all duration-300 retro-hover font-bold"
                  >
                    {settings.language === 'ja' ? 'はい、全て削除' : 'Yes, delete all'}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 bg-stone-300 vintage-text-primary px-3 py-2 rounded-[10px] text-sm hover:bg-stone-400 transition-colors font-medium"
                  >
                    {getTranslation('buttons.cancel', settings.language)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t-2 border-red-300">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:px-6 sm:py-3 vintage-text-secondary hover:vintage-text-primary transition-colors font-medium text-sm sm:text-base"
          >
            {getTranslation('buttons.cancel', settings.language)}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 sm:px-8 sm:py-3 vintage-button rounded-[10px] transition-all duration-300 retro-hover text-sm sm:text-base"
          >
            {getTranslation('buttons.save', settings.language)}
          </button>
        </div>
      </div>
    </div>
  );
};