import { useState, useEffect } from 'react';
import { Expense, ChatMessage, ChatbotSettings } from '../types';
import { getTranslation } from '../utils/translations';
import { useAuth } from './useAuth';

const BASE_STORAGE_KEY = 'expense-tracker-data';
const BASE_SETTINGS_KEY = 'chatbot-settings';

const defaultSettings: ChatbotSettings = {
  name: 'ExpenseBot',
  avatar: '/api/placeholder/40/40',
  personality: 'sarcastic',
  customTags: [],
  userName: 'Friend',
  language: 'en', // Changed default to English
  currency: 'USD',
  exchangeRate: 1
};

export const useExpenses = () => {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<ChatbotSettings>(defaultSettings);

  // Helper to get user-specific key
  const getKey = (base: string) => user ? `${base}-${user.id}` : base;

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(getKey(BASE_STORAGE_KEY));
    const savedSettings = localStorage.getItem(getKey(BASE_SETTINGS_KEY));
    
    if (saved) {
      const data = JSON.parse(saved);
      setExpenses(data.expenses || []);
      setMessages(data.messages || []);
    } else {
      setExpenses([]);
      setMessages([]);
    }
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({
        ...defaultSettings,
        ...parsedSettings,
        customTags: parsedSettings.customTags || [],
        userName: parsedSettings.userName || 'Friend',
        language: parsedSettings.language || 'en',
        currency: parsedSettings.currency || 'USD',
        exchangeRate: parsedSettings.exchangeRate || 1
      });
    } else {
      setSettings(defaultSettings);
    }
    // Add welcome message if no messages exist
    if (!saved || !JSON.parse(saved).messages?.length) {
      const welcomeMessage = settings.language === 'ja' 
        ? `こんにちは、${settings.userName || 'Friend'}さん！私はあなたの支出管理アシスタントです。支出を教えてください。例：「コーヒーに500円使いました」`
        : settings.language === 'zh'
        ? `你好，${settings.userName || 'Friend'}！我是您的支出跟踪助手。请告诉我您的支出。例如："我花了15美元买咖啡"`
        : settings.language === 'en'
        ? `Hey there, ${settings.userName || 'Friend'}! I'm your expense tracking buddy. Just tell me what you spent money on and I'll keep track of it.`
        : `こんにちは、${settings.userName || 'Friend'}さん！/ Hey there, ${settings.userName || 'Friend'}! 私はあなたの支出管理アシスタントです。/ I'm your expense tracking buddy. 支出を教えてください！/ Just tell me what you spent!`;
      addBotMessage(welcomeMessage);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getKey(BASE_STORAGE_KEY), JSON.stringify({ expenses, messages }));
    }
  }, [expenses, messages, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(getKey(BASE_SETTINGS_KEY), JSON.stringify(settings));
    }
  }, [settings, user]);

  const parseExpense = (text: string): Partial<Expense> | null => {
    // Enhanced regex patterns for expense parsing (supports multiple currencies)
    const patterns = [
      // USD patterns
      /(?:spent|paid|bought|cost|purchase[d]?)\s*(?:.*?)?\$(\d+(?:\.\d{2})?)\s*(?:on|for)?\s*(.*)/i,
      /\$(\d+(?:\.\d{2})?)\s*(?:on|for)?\s*(.*)/i,
      // JPY patterns
      /(?:spent|paid|bought|cost|purchase[d]?)\s*(?:.*?)?¥(\d+)\s*(?:on|for)?\s*(.*)/i,
      /¥(\d+)\s*(?:on|for)?\s*(.*)/i,
      /(\d+)\s*円\s*(?:on|for)?\s*(.*)/i,
      // Chinese patterns (add 塊 as a synonym for 元)
      /(?:花了|花费|买了|花)\s*(\d+(?:\.\d{2})?)\s*(?:元|美元|块钱?|塊錢?|塊)\s*(?:买|在)?\s*(.*)/i,
      /(\d+(?:\.\d{2})?)\s*(?:元|美元|块钱?|塊錢?|塊)\s*(?:买|在)?\s*(.*)/i,
      // Generic patterns
      /(\d+(?:\.\d{2})?)\s*(?:dollars?|bucks?|yen|円|元|美元|塊)\s*(?:on|for)?\s*(.*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseFloat(match[1]);
        const description = match[2]?.trim() || 'Misc expense';
        
        // Convert to base currency (USD) if needed
        if (text.includes('¥') || text.includes('円')) {
          amount = amount / (settings.exchangeRate || 150); // Convert JPY to USD
        }
        
        const category = categorizeExpense(description);
        const tags = extractTagsFromText(text);
        
        return { amount, description, category, tags };
      }
    }
    return null;
  };

  const extractTagsFromText = (text: string): string[] => {
    const tagPattern = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    
    while ((match = tagPattern.exec(text)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    
    return tags;
  };

  const categorizeExpense = (description: string): string => {
    const categories = {
      food: ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'coffee', 'groceries', 'grocery', 'snack', 'meal', 'コーヒー', '昼食', '夕食', '朝食', '食事', '咖啡', '午餐', '晚餐', '早餐', '食物'],
      transport: ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'car', 'transport', '交通', 'バス', '電車', 'タクシー', '公交', '地铁', '出租车'],
      shopping: ['clothes', 'clothing', 'shoes', 'shopping', 'amazon', 'store', 'mall', '買い物', '服', '靴', '购物', '衣服', '鞋子'],
      entertainment: ['movie', 'cinema', 'game', 'concert', 'show', 'entertainment', 'streaming', '映画', 'ゲーム', '娯楽', '电影', '游戏', '娱乐'],
      health: ['doctor', 'medicine', 'pharmacy', 'hospital', 'gym', 'fitness', 'health', '病院', '薬', '医者', 'ジム', '医生', '药', '医院', '健身房'],
      utilities: ['electricity', 'water', 'internet', 'phone', 'cable', 'utility', 'bill', '電気', '水道', 'インターネット', '电费', '水费', '网费'],
      housing: ['rent', 'mortgage', 'housing', 'home', 'apartment', '家賃', '住居', 'アパート', '房租', '住房', '公寓']
    };

    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    return 'other';
  };

  const generateBotResponse = (expense: Expense): string => {
    const userName = settings.userName || 'Friend';
    const lang = settings.language;
    
    const responses = {
      sarcastic: {
        en: {
          food: [
            `$${expense.amount} on ${expense.description}? I hope it was at least Instagram-worthy, ${userName}! 📸`,
            `Another $${expense.amount} for food, ${userName}? Your wallet is on a diet but apparently you're not! 🍔`,
            `${expense.description} for $${expense.amount}? Living the high life, I see! 🥂`,
            `$${expense.amount} on food again? At this rate, you'll be eating ramen by month-end, ${userName}! 🍜`,
            `Wow, ${expense.description} cost you $${expense.amount}? Hope it came with a side of financial wisdom! 💸`,
            `Spending $${expense.amount} on ${expense.description}? I hope it was worth every calorie! 😏`,
            `Food again, ${userName}? Your taste buds must be living their best life!`,
            `If only your savings grew as fast as your food expenses, ${userName}!`,
            `You could have bought a small farm for all that food, ${userName}!`,
            `At this rate, you'll be a food critic in no time!`,
            `Is this a food diary or an expense tracker, ${userName}?`,
            `Your stomach must be happier than your bank account!`,
          ],
          transport: [
            `$${expense.amount} for ${expense.description}? Gas prices or your driving skills - which is more expensive? 🚗`,
            `Another $${expense.amount} on transport, ${userName}? Maybe it's time to invest in a bike! 🚲`,
            `${expense.description} - $${expense.amount}? Your car is more expensive than some people's rent! 💰`,
            `You could have walked and saved $${expense.amount}, ${userName}!`,
            `Is your car running on gold, ${userName}?`,
            `Maybe teleportation will be cheaper someday!`,
            `At this rate, you'll be a shareholder in the local gas station!`,
            `Your car must be living its best life!`,
          ],
          shopping: [
            `$${expense.amount} on ${expense.description}? Because you definitely needed another shopping spree, right ${userName}? 🛍️`,
            `Shopping again? $${expense.amount} for ${expense.description}... your closet must be bursting! 👗`,
            `${expense.description} for $${expense.amount}? I'm sure it was absolutely essential! 🙄`,
            `Retail therapy is real, but so is your credit card bill!`,
            `You're single-handedly keeping the economy alive, ${userName}!`,
            `Another package on the way?`,
            `Your closet called—it's running out of space!`,
            `Impulse buy or investment? You decide!`,
          ],
          other: [
            `$${expense.amount} for ${expense.description}... interesting life choices, ${userName}! 🤔`,
            `Well, there goes $${expense.amount}, ${userName}! Money does grow on trees, right? 🌳💸`,
            `${expense.description} - $${expense.amount}? Your financial advisor would be so proud! 📊`,
            `Another $${expense.amount} expense? At least you're consistent, ${userName}! 🎯`,
            `$${expense.amount} on ${expense.description}? Bold financial strategy, let's see how it plays out! 🎲`,
            `That's one way to spend $${expense.amount}, I guess!`,
            `Your wallet must be exhausted!`,
            `You're making it rain, ${userName}!`,
            `I hope this was worth every penny!`,
            `You're a master of creative spending!`,
          ]
        },
        ja: {
          food: [
            `${expense.description}に${expense.amount}ドル？インスタ映えしたでしょうね、${userName}さん！📸`,
            `また食事に${expense.amount}ドル、${userName}さん？お財布がダイエット中ですね！🍔`,
            `${expense.description}に${expense.amount}ドル？贅沢な生活ですね！🥂`,
            `また食費に${expense.amount}ドル？この調子だと月末にはカップラーメンですね、${userName}さん！🍜`,
            `また食べ物ですか？${userName}さんの胃袋は幸せそうですね！`,
            `食費がどんどん増えてますね、${userName}さん！`,
            `このままいくとグルメ評論家になれそうですね！`,
            `お金が食べ物に変わる魔法ですね！`,
            `財布よりお腹が満たされてますね！`,
          ],
          transport: [
            `${expense.description}に${expense.amount}ドル？ガソリン代か運転技術、どちらが高くつくんでしょう？🚗`,
            `また交通費に${expense.amount}ドル、${userName}さん？自転車への投資を考えてみては？🚲`,
            `歩けば無料ですよ、${userName}さん！`,
            `車が贅沢品になってきましたね！`,
            `このままいくとガソリンスタンドの株主ですね！`,
            `移動費が家賃を超えそうですね！`,
            `次はどこに行くんですか？宇宙？`,
          ],
          shopping: [
            `${expense.description}に${expense.amount}ドル？また買い物ですか、${userName}さん？🛍️`,
            `また買い物？${expense.description}に${expense.amount}ドル...クローゼットがパンパンでしょうね！👗`,
            `衝動買いの達人ですね！`,
            `経済を回してますね、${userName}さん！`,
            `また荷物が届きますね！`,
            `クローゼットが悲鳴を上げてますよ！`,
            `本当に必要でしたか？`,
          ],
          other: [
            `${expense.description}に${expense.amount}ドル...面白い選択ですね、${userName}さん！🤔`,
            `${expense.amount}ドルが飛んでいきましたね、${userName}さん！お金は木に生えるんでしたっけ？🌳💸`,
            `その使い方、斬新ですね！`,
            `財布が泣いてますよ！`,
            `お金の使い方がクリエイティブですね！`,
            `一体何に使ったんですか？`,
            `毎日がエンターテイメントですね！`,
          ]
        },
        zh: [
          `這故事很有趣，但我需要金額才能記帳喔！試試「花了100元買咖啡」☕️`,
          `我不是通靈師，請給我一個金額，${userName}！💸`,
          `除非你真的花了0元，不然請再加個數字。😏`,
          `沒偵測到支出！除非你要誇獎我，不然請給我金額😉`,
          `我很愛聊天，但更愛記帳。給我一筆支出吧！💰`,
          `這訊息很有趣，但我只會記帳。試試「我花了50元買零食」☕️`,
          `我是記帳機器人，不是日記本，${userName}！請加上金額📒`,
          `想聊天找朋友，想記帳找我！😜`,
        ]
      },
      encouraging: {
        en: {
          food: [
            `Great job tracking, ${userName}! I've logged $${expense.amount} for ${expense.description}. Fuel for your awesome day! 🌟`,
            `$${expense.amount} for food - investing in your energy, ${userName}! Keep it up! 💪`,
            `Nice! ${expense.description} for $${expense.amount} - you deserve good food! 😊`,
            `Excellent tracking! $${expense.amount} on ${expense.description} - taking care of yourself is important! 🍽️`,
            `Way to go! ${expense.description} logged at $${expense.amount}. You're building great habits, ${userName}! 📈`
          ],
          transport: [
            `Perfect! $${expense.amount} for ${expense.description} - mobility is important for your goals! 🚗`,
            `Great tracking! ${expense.description} at $${expense.amount} - investing in getting places! 🛣️`,
            `Awesome! $${expense.amount} on transport - you're staying active and mobile! 🚀`
          ],
          shopping: [
            `Nice work! $${expense.amount} on ${expense.description} - treating yourself responsibly! 🛍️`,
            `Great job logging! ${expense.description} for $${expense.amount} - you deserve nice things! ✨`,
            `Excellent! $${expense.amount} shopping expense tracked - you're staying on top of your finances! 📊`
          ],
          other: [
            `Perfect, ${userName}! I've recorded $${expense.amount} for ${expense.description}. 📝`,
            `$${expense.amount} expense logged successfully! You're doing great tracking, ${userName}! 👍`,
            `Fantastic! ${expense.description} at $${expense.amount} - your financial awareness is impressive! 🎯`,
            `Well done! $${expense.amount} tracked for ${expense.description}. Keep up the excellent work! 🌟`,
            `Outstanding! Another expense logged at $${expense.amount}. You're a tracking superstar, ${userName}! ⭐`
          ]
        },
        ja: {
          food: [
            `記録お疲れ様、${userName}さん！${expense.description}に${expense.amount}ドルを記録しました。素晴らしい一日の燃料ですね！🌟`,
            `食事に${expense.amount}ドル - エネルギーへの投資ですね、${userName}さん！頑張って！💪`,
            `いいですね！${expense.description}に${expense.amount}ドル - 美味しい食事は大切です！😊`,
            `素晴らしい記録！${expense.description}に${expense.amount}ドル - 自分を大切にすることは重要ですね！🍽️`
          ],
          transport: [
            `完璧！${expense.description}に${expense.amount}ドル - 移動は目標達成に重要ですね！🚗`,
            `素晴らしい記録！${expense.description}に${expense.amount}ドル - 移動への投資ですね！🛣️`
          ],
          shopping: [
            `いい仕事！${expense.description}に${expense.amount}ドル - 責任を持って自分にご褒美ですね！🛍️`,
            `記録お疲れ様！${expense.description}に${expense.amount}ドル - 素敵なものを手に入れる価値がありますね！✨`
          ],
          other: [
            `完璧です、${userName}さん！${expense.description}に${expense.amount}ドルを記録しました。📝`,
            `${expense.amount}ドルの支出を記録しました！記録を続けて素晴らしいです、${userName}さん！👍`,
            `素晴らしい！${expense.description}に${expense.amount}ドル - 財務意識が素晴らしいです！🎯`
          ]
        },
        zh: [
          `記錄得很好，${userName}！我已經記錄了${expense.description}的${expense.amount}美元。為你美好的一天加油！🌟`,
          `食物花了${expense.amount}美元 - 這是對你能量的投資，${userName}！繼續保持！💪`,
          `很好！${expense.description}花了${expense.amount}美元 - 你值得好食物！😊`,
          `出色的記錄！${expense.description}花了${expense.amount}美元 - 照顧自己很重要！🍽️`
        ]
      },
      neutral: {
        en: [
          `Expense logged: $${expense.amount} for ${expense.description}`,
          `Recorded $${expense.amount} expense for ${expense.description}, ${userName}`,
          `Successfully tracked: ${expense.description} - $${expense.amount}`,
          `Added to your expenses: $${expense.amount} for ${expense.description}`,
          `Expense entry complete: ${expense.description} at $${expense.amount}`
        ],
        ja: [
          `支出を記録しました：${expense.description}に${expense.amount}ドル`,
          `${expense.description}に${expense.amount}ドルの支出を記録、${userName}さん`,
          `記録完了：${expense.description} - ${expense.amount}ドル`,
          `支出に追加：${expense.description}に${expense.amount}ドル`
        ],
        zh: [
          `支出已記錄：${expense.description}花了${expense.amount}美元`,
          `已記錄${expense.description}的${expense.amount}美元支出，${userName}`,
          `成功追蹤：${expense.description} - ${expense.amount}美元`,
          `已新增到您的支出：${expense.description}花了${expense.amount}美元`
        ]
      }
    };

    let response = '';
    
    if (settings.personality === 'neutral') {
      const neutralResponses = responses.neutral[lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh' : 'en'];
      response = neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    } else {
      const personalityResponses = responses[settings.personality];
      const langResponses = personalityResponses[lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh' : 'en'];
      const categoryResponses = langResponses[expense.category] || langResponses.other;
      response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }

    // Add bilingual response if needed
    if (lang === 'bilingual') {
      const resp = responses[settings.personality === 'neutral' ? 'neutral' : settings.personality];
      const enResp = resp['en'];
      const jaResp = resp['ja'];
      // If both are string arrays (error responses), just join the first
      if (Array.isArray(enResp) && Array.isArray(jaResp)) {
        response = `${jaResp[0]} / ${enResp[0]}`;
      } else if (!Array.isArray(enResp) && !Array.isArray(jaResp)) {
        // If both are objects (expense responses)
        const enObj = enResp as Record<string, string[]>;
        const jaObj = jaResp as Record<string, string[]>;
        const enCatArr = enObj[expense.category] || enObj.other;
        const jaCatArr = jaObj[expense.category] || jaObj.other;
        response = `${jaCatArr[0]} / ${enCatArr[0]}`;
      }
    }

    // Add tag information if tags exist
    if (expense.tags && expense.tags.length > 0) {
      const tagText = lang === 'ja' ? 'タグ付け' : lang === 'zh' ? '标签' : lang === 'en' ? 'Tagged with' : 'タグ付け / Tagged with';
      response += ` ${tagText}: ${expense.tags.map(tag => `#${tag}`).join(', ')}`;
    }

    return response;
  };

  const addExpense = (input: string) => {
    const parsedExpense = parseExpense(input);
    
    if (parsedExpense && parsedExpense.amount && parsedExpense.amount > 0) {
      const expense: Expense = {
        id: Date.now().toString(),
        amount: parsedExpense.amount,
        description: parsedExpense.description || 'Misc expense',
        category: parsedExpense.category || 'other',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        tags: parsedExpense.tags || []
      };

      setExpenses(prev => [...prev, expense]);
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: input,
        timestamp: Date.now(),
        expense
      };
      
      setMessages(prev => [...prev, userMessage]);

      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: generateBotResponse(expense),
          timestamp: Date.now() + 1
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);

      return true;
    } else {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: input,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);

      setTimeout(() => {
        const userName = settings.userName || 'Friend';
        const lang = settings.language;
        const personality = settings.personality || 'neutral';

        const errorResponses: Record<string, Record<string, string[]>> = {
          sarcastic: {
            en: [
              `Nice story, ${userName}, but I'm looking for numbers! Try something like 'Spent $10 on coffee' ☕️`,
              `I'm not a mind reader, ${userName}. Give me an amount, and I'll do my magic! 💸`,
              `Unless you paid $0 for that, I can't track it! Try again with an amount. 😏`,
              `No expense detected! Unless you're paying me in compliments, I need a number. 😉`,
              `I love a good chat, but I love numbers more. Give me an expense! 💰`,
              `That's a fun message, but my job is to track spending. Try 'I spent $5 on snacks' ☕️`,
              `I'm not your diary, ${userName}—I'm your expense tracker! Add an amount! 📒`,
              `If you want to chat, call a friend. If you want to track expenses, give me a number! 😜`,
            ],
            ja: [
              `面白い話ですね、${userName}さん。でも金額がないと記録できません！「コーヒーに500円使いました」みたいに教えてください☕️`,
              `エスパーじゃないので、金額を教えてください、${userName}さん！💸`,
              `0円なら記録しませんよ！金額を入れてもう一度どうぞ。😏`,
              `支出が見つかりません！褒め言葉じゃなくて金額をください😉`,
              `雑談もいいですが、私は支出記録係です。金額を教えてください！💰`,
              `楽しいメッセージですが、支出を記録したいです。「お菓子に300円使いました」みたいにどうぞ🍪`,
              `私は日記じゃなくて家計簿です、${userName}さん！金額を追加してください📒`,
              `おしゃべりしたいなら友達に！支出を記録したいなら金額を！😜`,
            ],
            zh: [
              `這故事很有趣，但我需要金額才能記帳喔！試試「花了100元買咖啡」☕️`,
              `我不是通靈師，請給我一個金額，${userName}！💸`,
              `除非你真的花了0元，不然請再加個數字。😏`,
              `沒偵測到支出！除非你要誇獎我，不然請給我金額😉`,
              `我很愛聊天，但更愛記帳。給我一筆支出吧！💰`,
              `這訊息很有趣，但我只會記帳。試試「我花了50元買零食」☕️`,
              `我是記帳機器人，不是日記本，${userName}！請加上金額📒`,
              `想聊天找朋友，想記帳找我！😜`,
            ]
          },
          encouraging: {
            en: [
              `Oops! I didn't catch an amount. Try something like 'I spent $5 on snacks'! 🍪`,
              `Let's track your spending! Just tell me how much you spent and on what. You got this! 💪`,
              `Almost there! Add an amount, and I'll log it for you. 📈`,
              `I'm here to help you track expenses! Try 'Bought coffee for $3' ☕️`,
              `You're doing great! Just add a number and I'll take care of the rest. 🌟`,
              `No expense detected, but I believe in you! Try '$10 for lunch' 🍱`,
              `Let's keep your budget on track! Add an amount and a description. 👍`,
            ],
            ja: [
              `あれ？金額が見つかりませんでした。「お菓子に300円使いました」みたいに入力してみてください🍪`,
              `支出を記録しましょう！「何にいくら使ったか」教えてください。応援してます💪`,
              `もう少し！金額を追加すれば記録できますよ📈`,
              `お手伝いします！「コーヒーに300円使いました」みたいに入力してみてください☕️`,
              `素晴らしいです！あとは金額を入力するだけです🌟`,
              `支出が見つかりませんでしたが、あなたならできます！「昼食に1000円」など試してみてください🍱`,
              `予算管理を続けましょう！金額と内容を教えてください👍`,
            ],
            zh: [
              `哎呀！我沒看到金額。試試「我花了50元買零食」🍪`,
              `讓我們一起記帳吧！只要告訴我花多少錢、花在哪裡就好。你可以的！💪`,
              `快完成了！加上金額我就能幫你記錄囉📈`,
              `我在這裡幫你記帳！試試「買咖啡花了30元」☕️`,
              `你很棒！只差一個金額就完成囉🌟`,
              `沒偵測到支出，但我相信你！試試「午餐100元」🍱`,
              `讓我們繼續保持預算！加上金額和內容就可以囉👍`,
            ]
          },
          neutral: {
            en: [
              `I couldn't find an expense amount. Please include something like '$12 for lunch'.`,
              `No amount detected. Try 'Bought groceries for $30'.`,
              `Please enter an expense with an amount, e.g., 'Spent $20 on gas'.`,
              `No expense found. Try 'I spent $15 on dinner'.`,
              `Please provide an amount and a description to log your expense.`,
            ],
            ja: [
              `支出金額が見つかりませんでした。「昼食に500円使いました」など金額を含めて入力してください。`,
              `金額が検出されませんでした。「食料品に3000円使いました」など試してください。`,
              `金額と内容を入力してください（例：「ガソリンに2000円使いました」）。`,
              `支出が見つかりませんでした。「夕食に1500円使いました」など試してください。`,
              `金額と説明を入力して支出を記錄してください。`,
            ],
            zh: [
              `未偵測到支出金額。請包含類似「午餐12美元」這樣的內容。`,
              `沒有偵測到金額。試試「買雜貨花了30美元」。`,
              `請輸入帶金額的支出，例如「加油花了20美元」。`,
              `未找到支出。試試「我花了15美元吃晚餐」。`,
              `請提供金額和描述以記錄支出。`,
            ]
          }
        };

        const errorResponseArr = (errorResponses[personality] as any)[lang];
        let errorMsg = '';
        if (Array.isArray(errorResponseArr)) {
          errorMsg = errorResponseArr[Math.floor(Math.random() * errorResponseArr.length)];
        } else {
          errorMsg = errorResponses[personality]['en'][0];
        }

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: errorMsg,
          timestamp: Date.now() + 1
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);

      return false;
    }
  };

  const addBotMessage = (content: string) => {
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const clearAllData = () => {
    setExpenses([]);
    setMessages([]);
    const userName = settings.userName || 'Friend';
    const lang = settings.language;
    
    const clearMessages = {
      en: [
        `All your data has been cleared, ${userName}! Ready for a fresh start? 🆕`,
        `Clean slate time, ${userName}! All expenses wiped clean. Let's start tracking again! ✨`,
        `Data cleared successfully, ${userName}! Time to build new spending habits! 🚀`
      ],
      ja: [
        `すべてのデータが削除されました、${userName}さん！新しいスタートの準備はできましたか？🆕`,
        `クリーンスレートの時間です、${userName}さん！すべての支出がクリアされました。また記録を始めましょう！✨`,
        `データが正常に削除されました、${userName}さん！新しい支出習慣を築く時間です！🚀`
      ],
      zh: [
        `所有資料已清除，${userName}！準備好重新開始了嗎？🆕`,
        `重新開始的時候到了，${userName}！所有支出都已清除。讓我們重新開始記帳！✨`,
        `資料清除成功，${userName}！是時候建立新的消費習慣了！🚀`
      ]
    };
    
    const messages = clearMessages[lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh' : 'en'];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    if (lang === 'bilingual') {
      const enMessage = clearMessages.en[0];
      const jaMessage = clearMessages.ja[0];
      message = `${jaMessage} / ${enMessage}`;
    }
    
    addBotMessage(message);
  };

  const updateSettings = (newSettings: Partial<ChatbotSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addCustomTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !settings.customTags.includes(trimmedTag)) {
      setSettings(prev => ({
        ...prev,
        customTags: [...prev.customTags, trimmedTag]
      }));
    }
  };

  const removeCustomTag = (tag: string) => {
    setSettings(prev => ({
      ...prev,
      customTags: prev.customTags.filter(t => t !== tag)
    }));
  };

  const updateExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId ? { ...expense, ...updates } : expense
    ));

    setMessages(prev => prev.map(message => {
      if (message.expense && message.expense.id === expenseId) {
        const updatedExpense = { ...message.expense, ...updates };
        const newContent = `I spent $${updatedExpense.amount.toFixed(2)} on ${updatedExpense.description}${
          updatedExpense.tags && updatedExpense.tags.length > 0 
            ? ` ${updatedExpense.tags.map(tag => `#${tag}`).join(' ')}`
            : ''
        }`;
        
        return {
          ...message,
          content: newContent,
          expense: updatedExpense
        };
      }
      return message;
    }));

    setTimeout(() => {
      const userName = settings.userName || 'Friend';
      const lang = settings.language;
      
      const updateMessages = {
        en: [
          `Got it, ${userName}! I've updated your expense. ✏️`,
          `Perfect! Your expense has been updated, ${userName}! 📝`,
          `Changes saved successfully, ${userName}! ✅`
        ],
        ja: [
          `了解しました、${userName}さん！支出を更新しました。✏️`,
          `完璧！支出が更新されました、${userName}さん！📝`,
          `変更が正常に保存されました、${userName}さん！✅`
        ],
        zh: [
          `明白了，${userName}！我已經更新了您的支出。✏️`,
          `完美！您的支出已更新，${userName}！📝`,
          `更改保存成功，${userName}！✅`
        ]
      };
      
      const messages = updateMessages[lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh' : 'en'];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      if (lang === 'bilingual') {
        const enMessage = updateMessages.en[0];
        const jaMessage = updateMessages.ja[0];
        message = `${jaMessage} / ${enMessage}`;
      }
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    setMessages(prev => prev.filter(message => 
      !(message.expense && message.expense.id === expenseId)
    ));

    setTimeout(() => {
      const userName = settings.userName || 'Friend';
      const lang = settings.language;
      
      const deleteMessages = {
        en: [
          `Expense deleted, ${userName}! 🗑️`,
          `Gone! That expense has been removed, ${userName}! ✨`,
          `Deleted successfully, ${userName}! One less expense to worry about! 👍`
        ],
        ja: [
          `支出を削除しました、${userName}さん！🗑️`,
          `削除完了！その支出は削除されました、${userName}さん！✨`,
          `正常に削除されました、${userName}さん！心配する支出が一つ減りました！👍`
        ],
        zh: [
          `支出已刪除，${userName}！🗑️`,
          `刪除了！那筆支出已被移除，${userName}！✨`,
          `刪除成功，${userName}！少了一筆需要擔心的支出！👍`
        ]
      };
      
      const messages = deleteMessages[lang === 'ja' ? 'ja' : lang === 'zh' ? 'zh' : 'en'];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      if (lang === 'bilingual') {
        const enMessage = deleteMessages.en[0];
        const jaMessage = deleteMessages.ja[0];
        message = `${jaMessage} / ${enMessage}`;
      }
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  return {
    expenses,
    messages,
    settings,
    addExpense,
    addBotMessage,
    clearAllData,
    updateSettings,
    addCustomTag,
    removeCustomTag,
    updateExpense,
    deleteExpense
  };
};