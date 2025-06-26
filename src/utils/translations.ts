export const translations = {
  en: {
    appTitle: 'Moolah',
    appSubtitle: '',
    totalSpent: 'Total Spent',
    settings: 'Settings',
    reports: 'Reports',
    welcome: 'Welcome to Moolah!',
    welcomeDesc: 'Track your expenses with ease. Use the calculator, scan receipts, or just tell me what you spent!',
    placeholder: 'Tell me about your expense... (e.g., "I spent $15 on coffee")',
    categories: {
      food: 'Food & Dining',
      transport: 'Transportation',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      health: 'Health & Fitness',
      utilities: 'Utilities',
      housing: 'Housing',
      other: 'Other'
    },
    buttons: {
      save: 'Save Changes',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      clear: 'Clear All Data',
      calculator: 'Calculator',
      camera: 'Scan Receipt',
      send: 'Send'
    },
    modals: {
      settings: 'Settings',
      reports: 'Expense Reports',
      editExpense: 'Edit Expense',
      calculator: 'Calculator'
    }
  },
  ja: {
    appTitle: 'Moolah',
    appSubtitle: '',
    totalSpent: '総支出',
    settings: '設定',
    reports: 'レポート',
    welcome: 'Moolahへようこそ！',
    welcomeDesc: '簡単に支出を記録できます。計算機を使ったり、レシートをスキャンしたり、支出を教えてください！',
    placeholder: '支出を教えてください...（例：「コーヒーに500円使いました」）',
    categories: {
      food: '食事・飲食',
      transport: '交通費',
      shopping: '買い物',
      entertainment: '娯楽',
      health: '健康・医療',
      utilities: '光熱費',
      housing: '住居費',
      other: 'その他'
    },
    buttons: {
      save: '変更を保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      clear: '全データ削除',
      calculator: '計算機',
      camera: 'レシートスキャン',
      send: '送信'
    },
    modals: {
      settings: '設定',
      reports: '支出レポート',
      editExpense: '支出編集',
      calculator: '計算機'
    }
  },
  zh: {
    appTitle: 'Moolah',
    appSubtitle: '',
    totalSpent: '总支出',
    settings: '设置',
    reports: '报告',
    welcome: '欢迎使用Moolah！',
    welcomeDesc: '轻松跟踪您的支出。使用计算器、扫描收据，或者告诉我您花了什么钱！',
    placeholder: '告诉我您的支出...（例如："我花了15美元买咖啡"）',
    categories: {
      food: '餐饮',
      transport: '交通',
      shopping: '购物',
      entertainment: '娱乐',
      health: '健康健身',
      utilities: '公用事业',
      housing: '住房',
      other: '其他'
    },
    buttons: {
      save: '保存更改',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      clear: '清除所有数据',
      calculator: '计算器',
      camera: '扫描收据',
      send: '发送'
    },
    modals: {
      settings: '设置',
      reports: '支出报告',
      editExpense: '编辑支出',
      calculator: '计算器'
    }
  },
  bilingual: {
    appTitle: 'Moolah',
    appSubtitle: '',
    totalSpent: '总支出 / Total Spent',
    settings: '设置 / Settings',
    reports: 'レポート / Reports',
    welcome: 'Moolahへようこそ！ / Welcome to Moolah!',
    welcomeDesc: '昭和の温かみを感じながら、家计簿をつけましょう。/ Track your expenses with the warmth of the Showa era.',
    placeholder: '支出を教えてください... / Tell me about your expense...',
    categories: {
      food: '食事・飲食 / Food & Dining',
      transport: '交通费 / Transportation',
      shopping: '买い物 / Shopping',
      entertainment: '娱乐 / Entertainment',
      health: '健康・医疗 / Health & Fitness',
      utilities: '光热费 / Utilities',
      housing: '住居费 / Housing',
      other: 'その他 / Other'
    },
    buttons: {
      save: '变更を保存 / Save Changes',
      cancel: 'キャンセル / Cancel',
      delete: '删除 / Delete',
      edit: '编辑 / Edit',
      clear: '全データ削除 / Clear All Data',
      calculator: '计算机 / Calculator',
      camera: 'レシートスキャン / Scan Receipt',
      send: '送信 / Send'
    },
    modals: {
      settings: '设置 / Settings',
      reports: '支出レポート / Expense Reports',
      editExpense: '支出编辑 / Edit Expense',
      calculator: '计算机 / Calculator'
    }
  }
};

export const currencies = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 150 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.75 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.45 }
};

export const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'ja' as const, name: '日本語', flag: '🇯🇵' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳' },
  { code: 'bilingual' as const, name: 'Bilingual', flag: '🌐' }
];

export const getTranslation = (key: string, language: 'en' | 'ja' | 'zh' | 'bilingual') => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const formatCurrency = (amount: number, currency: string, rate: number) => {
  const convertedAmount = amount * rate;
  const currencyInfo = currencies[currency as keyof typeof currencies];
  
  if (currency === 'JPY') {
    return `${currencyInfo.symbol}${Math.round(convertedAmount).toLocaleString()}`;
  }
  
  return `${currencyInfo.symbol}${convertedAmount.toFixed(2)}`;
};