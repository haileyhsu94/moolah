import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertTriangle, Tag, Plus } from 'lucide-react';
import { Expense, EditableExpense, ChatbotSettings } from '../types';
import { getTranslation, formatCurrency, currencies } from '../utils/translations';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (expenseId: string) => void;
  customTags: string[];
  settings: ChatbotSettings;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  onUpdateExpense,
  onDeleteExpense,
  customTags,
  settings
}) => {
  const [editableExpense, setEditableExpense] = useState<EditableExpense>({
    id: '',
    amount: 0,
    description: '',
    category: 'other',
    tags: []
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'food', label: getTranslation('categories.food', settings.language) },
    { value: 'transport', label: getTranslation('categories.transport', settings.language) },
    { value: 'shopping', label: getTranslation('categories.shopping', settings.language) },
    { value: 'entertainment', label: getTranslation('categories.entertainment', settings.language) },
    { value: 'health', label: getTranslation('categories.health', settings.language) },
    { value: 'utilities', label: getTranslation('categories.utilities', settings.language) },
    { value: 'housing', label: getTranslation('categories.housing', settings.language) },
    { value: 'other', label: getTranslation('categories.other', settings.language) }
  ];

  useEffect(() => {
    if (expense && isOpen) {
      setEditableExpense({
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        tags: expense.tags || []
      });
      setErrors({});
      setShowDeleteConfirm(false);
      setNewTag('');
    }
  }, [expense, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editableExpense.amount || editableExpense.amount <= 0) {
      newErrors.amount = settings.language === 'ja' ? '金額は0より大きくしてください' : 'Amount must be greater than 0';
    }

    if (!editableExpense.description.trim()) {
      newErrors.description = settings.language === 'ja' ? '説明は必須です' : 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onUpdateExpense(editableExpense.id, {
      amount: editableExpense.amount,
      description: editableExpense.description.trim(),
      category: editableExpense.category,
      tags: editableExpense.tags
    });
    onClose();
  };

  const handleDelete = () => {
    onDeleteExpense(editableExpense.id);
    onClose();
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim().toLowerCase();
    if (tag && !editableExpense.tags.includes(tag)) {
      setEditableExpense(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditableExpense(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleQuickAddTag = (tag: string) => {
    if (!editableExpense.tags.includes(tag)) {
      setEditableExpense(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  if (!isOpen || !expense) return null;

  const currencyInfo = currencies[settings.currency];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="vintage-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto vintage-shadow paper-texture poster-style">
        <div className="flex items-center justify-between p-6 border-b-2 border-red-300">
          <h2 className="text-xl font-bold vintage-text-primary japanese-text">
            {getTranslation('modals.editExpense', settings.language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 vintage-text-primary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3">
              {settings.language === 'ja' ? '金額' : settings.language === 'en' ? 'Amount' : '金額 / Amount'} *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 vintage-text-secondary font-bold">
                {currencyInfo.symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editableExpense.amount || ''}
                onChange={(e) => setEditableExpense(prev => ({ 
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0 
                }))}
                className={`w-full pl-10 pr-4 py-3 vintage-input rounded-xl focus:outline-none ${
                  errors.amount ? 'border-red-500' : ''
                }`}
                placeholder="0.00"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm vintage-text-muted">
                {formatCurrency(editableExpense.amount, settings.currency, currencyInfo.rate)}
              </div>
            </div>
            {errors.amount && (
              <p className="text-red-700 text-sm mt-2 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3">
              {settings.language === 'ja' ? '説明' : settings.language === 'en' ? 'Description' : '説明 / Description'} *
            </label>
            <input
              type="text"
              value={editableExpense.description}
              onChange={(e) => setEditableExpense(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              className={`w-full px-4 py-3 vintage-input rounded-xl focus:outline-none ${
                errors.description ? 'border-red-500' : ''
              }`}
              placeholder={settings.language === 'ja' ? '何に使いましたか？' : 'What did you spend on?'}
            />
            {errors.description && (
              <p className="text-red-700 text-sm mt-2 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3">
              {settings.language === 'ja' ? 'カテゴリー' : settings.language === 'en' ? 'Category' : 'カテゴリー / Category'}
            </label>
            <select
              value={editableExpense.category}
              onChange={(e) => setEditableExpense(prev => ({ 
                ...prev, 
                category: e.target.value 
              }))}
              className="w-full px-4 py-3 vintage-input rounded-xl focus:outline-none"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold vintage-text-primary mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              {settings.language === 'ja' ? 'タグ' : settings.language === 'en' ? 'Tags' : 'タグ / Tags'}
            </label>
            
            <form onSubmit={handleAddTag} className="flex gap-3 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={settings.language === 'ja' ? 'タグを追加...' : 'Add tag...'}
                className="flex-1 px-4 py-3 vintage-input rounded-xl focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!newTag.trim()}
                className="vintage-button px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed retro-hover"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {customTags.length > 0 && (
              <div className="mb-4">
                <p className="text-xs vintage-text-muted mb-2 font-medium">
                  {settings.language === 'ja' ? 'クイック追加:' : 'Quick add:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {customTags
                    .filter(tag => !editableExpense.tags.includes(tag))
                    .slice(0, 6)
                    .map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleQuickAddTag(tag)}
                        className="text-xs bg-stone-200 vintage-text-secondary px-3 py-2 rounded-full hover:bg-stone-300 transition-colors font-medium"
                      >
                        #{tag}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {editableExpense.tags.map(tag => (
                <div
                  key={tag}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-200 to-red-300 text-red-800 px-3 py-2 rounded-full text-sm font-medium border border-red-400"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-700 hover:text-red-900 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Section */}
          <div className="pt-4 border-t-2 border-red-300">
            <label className="block text-sm font-bold text-red-800 mb-3">
              {settings.language === 'ja' ? '危険ゾーン' : settings.language === 'en' ? 'Danger Zone' : '危険ゾーン / Danger Zone'}
            </label>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="vintage-button-secondary px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 retro-hover"
              >
                <Trash2 className="w-5 h-5" />
                {getTranslation('buttons.delete', settings.language)}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-800">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-bold">
                    {settings.language === 'ja' ? '本当によろしいですか？' : 'Are you sure?'}
                  </span>
                </div>
                <p className="text-sm vintage-text-secondary">
                  {settings.language === 'ja' 
                    ? 'この支出は完全に削除され、元に戻すことはできません。'
                    : 'This expense will be permanently deleted and cannot be recovered.'
                  }
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="vintage-button-secondary px-4 py-2 rounded-xl text-sm transition-all duration-300 flex items-center gap-2 retro-hover"
                  >
                    <Trash2 className="w-4 h-4" />
                    {settings.language === 'ja' ? 'はい、削除します' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-stone-300 vintage-text-primary px-4 py-2 rounded-xl text-sm hover:bg-stone-400 transition-colors font-medium"
                  >
                    {getTranslation('buttons.cancel', settings.language)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6 border-t-2 border-red-300">
          <button
            onClick={onClose}
            className="px-6 py-3 vintage-text-secondary hover:vintage-text-primary transition-colors font-medium"
          >
            {getTranslation('buttons.cancel', settings.language)}
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 vintage-button rounded-xl transition-all duration-300 flex items-center gap-2 retro-hover"
          >
            <Save className="w-5 h-5" />
            {getTranslation('buttons.save', settings.language)}
          </button>
        </div>
      </div>
    </div>
  );
};