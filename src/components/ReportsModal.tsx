import React, { useState } from 'react';
import { X, TrendingUp, PieChart, Calendar, Tag } from 'lucide-react';
import { ExpenseReport, ChatbotSettings } from '../types';
import { useReports, getPeriodRange, generateReport } from '../hooks/useReports';
import { getTranslation, formatCurrency, currencies } from '../utils/translations';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: any[];
  settings: ChatbotSettings;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose, expenses, settings }) => {
  const { dailyReport, weeklyReport, monthlyReport, annualReport, generateReport: genReport, getPeriodRange } = useReports(expenses);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [baseDate, setBaseDate] = useState(new Date());

  if (!isOpen) return null;

  const currentReport = generateReport(expenses, selectedPeriod, baseDate);
  const { startDate, endDate } = getPeriodRange(selectedPeriod, baseDate);

  const currencyInfo = currencies[settings.currency];

  const getCategoryColor = (index: number) => {
    const colors = ['bg-red-600', 'bg-red-700', 'bg-stone-600', 'bg-stone-700', 'bg-red-800', 'bg-stone-800'];
    return colors[index % colors.length];
  };

  const getTagColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-stone-500', 'bg-red-600', 'bg-stone-600', 'bg-red-700', 'bg-stone-700'];
    return colors[index % colors.length];
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      daily: {
        en: 'Daily',
        ja: '日間',
        zh: '每日',
        bilingual: '日間 / Daily'
      },
      weekly: {
        en: 'Weekly',
        ja: '週間',
        zh: '每周',
        bilingual: '週間 / Weekly'
      },
      monthly: {
        en: 'Monthly',
        ja: '月間',
        zh: '每月',
        bilingual: '月間 / Monthly'
      },
      annual: {
        en: 'Annual',
        ja: '年間',
        zh: '每年',
        bilingual: '年間 / Annual'
      }
    };
    return labels[period as keyof typeof labels][settings.language] || labels[period as keyof typeof labels].en;
  };

  // Helper to format date range
  const formatDate = (date: Date) => date.toLocaleDateString();
  const formatRange = (start: Date, end: Date, period: string) => {
    if (period === 'daily') return formatDate(start);
    // end is exclusive, so subtract one day
    const endDisplay = new Date(end.getTime() - 24*60*60*1000);
    return `${formatDate(start)} - ${formatDate(endDisplay)}`;
  };

  // Navigation handlers
  const changePeriod = (amount: number) => {
    const newDate = new Date(baseDate);
    switch (selectedPeriod) {
      case 'daily':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7 * amount);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
      case 'annual':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
    }
    setBaseDate(newDate);
  };

  // When switching period, reset baseDate to today
  const handlePeriodChange = (period: typeof selectedPeriod) => {
    setSelectedPeriod(period);
    setBaseDate(new Date());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-x-hidden">
      <div className="vintage-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden vintage-shadow paper-texture poster-style">
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(153, 27, 27, 0.2)' }}>
          <h2 className="text-2xl font-bold vintage-text-primary flex items-center gap-3 japanese-text">
            <TrendingUp className="w-7 h-7 text-red-700" />
            {getTranslation('modals.reports', settings.language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-7 h-7 vintage-text-primary" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Period Selector */}
          <div className="mb-8">
            <div className="flex gap-3 flex-wrap">
              {['daily', 'weekly', 'monthly', 'annual'].map((period, idx) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period as any)}
                  className={`neo-button px-6 py-3 text-base rounded-[10px] retro-hover font-bold transition-all duration-300 ${
                    selectedPeriod === period
                      ? 'neo-button-yellow'
                      : 'bg-stone-200 vintage-text-primary hover:bg-yellow-100'
                  }`}
                >
                  <span className="hidden xs:inline">{getPeriodLabel(period)}</span>
                  <span className="inline xs:hidden">{['D','W','M','A'][idx]}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 xs:mt-0 xs:ml-6">
              <button onClick={() => changePeriod(-1)} className="neo-button neo-button-yellow px-3 py-2 rounded-[10px] font-bold retro-hover">&#8592;</button>
              <span className="font-bold vintage-text-primary text-base">
                {formatRange(startDate, endDate, selectedPeriod)}
              </span>
              <button onClick={() => changePeriod(1)} className="neo-button neo-button-yellow px-3 py-2 rounded-[10px] font-bold retro-hover">&#8594;</button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="vintage-bg-accent p-6 rounded-2xl text-stone-50 vintage-shadow vintage-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm font-medium">
                    {getTranslation('totalSpent', settings.language)}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(currentReport.totalAmount, settings.currency, currencyInfo.rate)}
                  </p>
                  {settings.currency !== 'USD' && (
                    <p className="text-sm opacity-75">${currentReport.totalAmount.toFixed(2)} USD</p>
                  )}
                </div>
                <TrendingUp className="w-8 h-8 text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-700 to-green-800 p-6 rounded-2xl text-white vintage-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    {settings.language === 'ja' ? '支出回数' : settings.language === 'zh' ? '支出次数' : settings.language === 'en' ? 'Total Expenses' : '支出回数 / Total Expenses'}
                  </p>
                  <p className="text-2xl font-bold">{currentReport.expenseCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-700 to-yellow-800 p-6 rounded-2xl text-white vintage-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">
                    {settings.language === 'ja' ? '平均支出' : settings.language === 'zh' ? '平均支出' : settings.language === 'en' ? 'Average' : '平均支出 / Average'}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(currentReport.averageExpense, settings.currency, currencyInfo.rate)}
                  </p>
                  {settings.currency !== 'USD' && (
                    <p className="text-sm opacity-75">${currentReport.averageExpense.toFixed(2)} USD</p>
                  )}
                </div>
                <PieChart className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-700 to-purple-800 p-6 rounded-2xl text-white vintage-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    {settings.language === 'ja' ? 'トップカテゴリー' : settings.language === 'zh' ? '热门类别' : 'Top Category'}
                  </p>
                  <p className="text-xl font-bold capitalize">
                    {currentReport.topCategories[0]?.category || (settings.language === 'ja' ? 'なし' : settings.language === 'zh' ? '无' : 'None')}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-purple-800 font-bold text-sm">
                    {currentReport.topCategories[0]?.percentage.toFixed(0) || '0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 gap-y-8 mb-8">
            {/* Category Breakdown */}
            <div className="vintage-card rounded-2xl p-6 vintage-shadow">
              <h3 className="text-lg font-bold vintage-text-primary mb-6 flex items-center gap-2 japanese-text">
                <PieChart className="w-6 h-6" />
                {settings.language === 'ja' ? 'カテゴリー別' : settings.language === 'zh' ? '按类别分类' : settings.language === 'en' ? 'Category Breakdown' : 'カテゴリー別 / Category Breakdown'}
              </h3>
              
              {currentReport.topCategories.length > 0 ? (
                <div className="space-y-6">
                  {currentReport.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full ${getCategoryColor(index)}`}></div>
                        <span className="font-bold capitalize vintage-text-primary">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold vintage-text-primary">
                          {formatCurrency(category.amount, settings.currency, currencyInfo.rate)}
                        </div>
                        <div className="text-sm vintage-text-muted">{category.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-8 space-y-3">
                    {currentReport.topCategories.slice(0, 5).map((category, index) => (
                      <div key={`bar-${category.category}`} className="flex items-center gap-4">
                        <div className="w-24 text-sm capitalize vintage-text-secondary font-medium">{category.category}</div>
                        <div className="flex-1 bg-stone-300 rounded-full h-4 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getCategoryColor(index)}`}
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm text-right vintage-text-primary font-bold">{category.percentage.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 vintage-text-muted">
                  <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">
                    {settings.language === 'ja' ? 'この期間の支出が見つかりません' : settings.language === 'zh' ? '此期间未找到支出' : 'No expenses found for this period'}
                  </p>
                </div>
              )}
            </div>

            {/* Tag Breakdown */}
            <div className="vintage-card rounded-2xl p-6 vintage-shadow">
              <h3 className="text-lg font-bold vintage-text-primary mb-6 flex items-center gap-2 japanese-text">
                <Tag className="w-6 h-6" />
                {settings.language === 'ja' ? 'タグ別' : settings.language === 'zh' ? '按标签分类' : settings.language === 'en' ? 'Tag Breakdown' : 'タグ別 / Tag Breakdown'}
              </h3>
              
              {currentReport.topTags && currentReport.topTags.length > 0 ? (
                <div className="space-y-6">
                  {currentReport.topTags.slice(0, 8).map((tag, index) => (
                    <div key={tag.tag} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full ${getTagColor(index)}`}></div>
                        <span className="font-bold vintage-text-primary">#{tag.tag}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold vintage-text-primary">
                          {formatCurrency(tag.amount, settings.currency, currencyInfo.rate)}
                        </div>
                        <div className="text-sm vintage-text-muted">{tag.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-8 space-y-3">
                    {currentReport.topTags.slice(0, 5).map((tag, index) => (
                      <div key={`tag-bar-${tag.tag}`} className="flex items-center gap-4">
                        <div className="w-24 text-sm vintage-text-secondary font-medium">#{tag.tag}</div>
                        <div className="flex-1 bg-stone-300 rounded-full h-4 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getTagColor(index)}`}
                            style={{ width: `${tag.percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm text-right vintage-text-primary font-bold">{tag.percentage.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 vintage-text-muted">
                  <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">
                    {settings.language === 'ja' ? 'タグ付きの支出が見つかりません' : settings.language === 'zh' ? '未找到带标签的支出' : 'No tagged expenses found'}
                  </p>
                  <p className="text-sm mt-2">
                    {settings.language === 'ja' 
                      ? '支出に「#仕事 #昼食」のようにハッシュタグを使ってください！'
                      : settings.language === 'zh'
                      ? '在支出中使用"#工作 #午餐"这样的标签！'
                      : 'Use hashtags like "#work #lunch" in your expenses!'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Expense List */}
          <div className="mt-16">
            <div className="vintage-card rounded-2xl p-6 vintage-shadow w-full max-w-full">
              <h3 className="text-lg font-bold vintage-text-primary mb-6 flex items-center gap-2 japanese-text">
                <Calendar className="w-6 h-6" />
                {settings.language === 'ja'
                  ? '支出一覧'
                  : settings.language === 'zh'
                    ? '支出明細'
                    : settings.language === 'en'
                      ? 'Expense List'
                      : '支出一覧 / Expense List'}
              </h3>
              <table className="w-full text-xs sm:text-sm rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-stone-200">
                    <th className="px-2 py-1 text-left font-bold vintage-text-primary whitespace-nowrap">Date</th>
                    <th className="px-2 py-1 text-left font-bold vintage-text-primary break-words">Description</th>
                    <th className="px-2 py-1 text-left font-bold vintage-text-primary whitespace-nowrap">Category</th>
                    <th className="px-2 py-1 text-right font-bold vintage-text-primary whitespace-nowrap">Amount</th>
                    <th className="px-2 py-1 text-left font-bold vintage-text-primary break-words hidden xs:table-cell">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses
                    .filter(exp => {
                      const d = new Date(exp.date + 'T00:00:00');
                      return d >= startDate && d < endDate;
                    })
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(exp => (
                      <tr key={exp.id} className="border-b last:border-b-0">
                        <td className="px-2 py-1 whitespace-nowrap">{exp.date}</td>
                        <td className="px-2 py-1 break-words">{exp.description}</td>
                        <td className="px-2 py-1 capitalize whitespace-nowrap">{exp.category}</td>
                        <td className="px-2 py-1 text-right whitespace-nowrap">{formatCurrency(exp.amount, settings.currency, currencyInfo.rate)}</td>
                        <td className="px-2 py-1 break-words hidden xs:table-cell">
                          {exp.tags && exp.tags.length > 0
                            ? exp.tags.map((tag: string) => (
                                <span key={tag} className="inline-block bg-yellow-100 text-yellow-800 rounded px-2 py-1 mr-1 text-xs font-bold border border-yellow-300">#{tag}</span>
                              ))
                            : <span className="text-stone-400">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {expenses.filter(exp => {
                const d = new Date(exp.date + 'T00:00:00');
                return d >= startDate && d < endDate;
              }).length === 0 && (
                <div className="text-center py-8 vintage-text-muted">
                  {settings.language === 'ja'
                    ? 'この期間の支出はありません'
                    : settings.language === 'zh'
                      ? '此期间没有支出'
                      : 'No expenses for this period.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};