import { useMemo } from 'react';
import { Expense, ExpenseReport } from '../types';

export function getPeriodRange(period: 'daily' | 'weekly' | 'monthly' | 'annual', baseDate: Date) {
  let startDate: Date, endDate: Date;
  switch (period) {
    case 'daily':
      startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      break;
    case 'weekly': {
      const day = baseDate.getDay();
      startDate = new Date(baseDate);
      startDate.setDate(baseDate.getDate() - day);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
    }
    case 'monthly':
      startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
      break;
    case 'annual':
      startDate = new Date(baseDate.getFullYear(), 0, 1);
      endDate = new Date(baseDate.getFullYear() + 1, 0, 1);
      break;
  }
  return { startDate, endDate };
}

export function generateReport(expenses: Expense[], period: 'daily' | 'weekly' | 'monthly' | 'annual', baseDate: Date) {
  const { startDate, endDate } = getPeriodRange(period, baseDate);
  const filteredExpenses = expenses.filter(expense => {
    const d = new Date(expense.date + 'T00:00:00');
    return d >= startDate && d < endDate;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseCount = filteredExpenses.length;
  const averageExpense = expenseCount > 0 ? totalAmount / expenseCount : 0;

  const categoryBreakdown: Record<string, number> = {};
  const tagBreakdown: Record<string, number> = {};
  
  filteredExpenses.forEach(expense => {
    categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
    if (expense.tags) {
      expense.tags.forEach(tag => {
        tagBreakdown[tag] = (tagBreakdown[tag] || 0) + expense.amount;
      });
    }
  });

  const topCategories = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  const topTags = Object.entries(tagBreakdown)
    .map(([tag, amount]) => ({
      tag,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    period,
    totalAmount,
    categoryBreakdown,
    expenseCount,
    averageExpense,
    topCategories,
    tagBreakdown,
    topTags,
    startDate,
    endDate
  };
}

export const useReports = (expenses: Expense[]) => {
  const now = new Date();
  return {
    dailyReport: generateReport(expenses, 'daily', now),
    weeklyReport: generateReport(expenses, 'weekly', now),
    monthlyReport: generateReport(expenses, 'monthly', now),
    annualReport: generateReport(expenses, 'annual', now),
    generateReport: (period: 'daily' | 'weekly' | 'monthly' | 'annual', baseDate: Date) => generateReport(expenses, period, baseDate),
    getPeriodRange
  };
};