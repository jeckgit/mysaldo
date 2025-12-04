import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  BarChart3, 
  Plus, 
  ChevronLeft, 
  Wallet,
  Home,
  User,
  Bell,
  ArrowUpRight,
  ShoppingBag,
  Coffee,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer,
  Cell,
  XAxis
} from 'recharts';

import { AppState, Transaction, ViewState } from './types';
import { loadState, saveState, clearState } from './services/storageService';
import { GlassCard, GlassButton, BackgroundMesh } from './components/GlassUI';
import { HaloRing } from './components/HaloRing';

// --- Constants ---
const COLORS = {
  mint: '#34D399',
  coral: '#F87171',
  pink: '#F472B6',
  purple: '#C084FC',
  blue: '#60A5FA',
  slate: '#F1F5F9'
};

// --- Helper Functions ---
const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}`;
};

const formatCurrency = (amount: number, symbol: string) => {
  return `${symbol}${Math.abs(amount).toFixed(0)}`;
};

// --- Components ---

const NumberPad = ({ onInput, onDelete, onSubmit, value }: { 
  onInput: (n: number) => void, 
  onDelete: () => void, 
  onSubmit: () => void,
  value: string
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'del'];
  
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto mt-4">
      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => n === 'del' ? onDelete() : n === '.' ? null : onInput(Number(n))}
          className={`
            h-16 rounded-[1.5rem] text-2xl font-medium transition-all active:scale-95 flex items-center justify-center
            ${n === 'del' ? 'text-red-400 bg-red-50/50' : 'text-slate-800 bg-white/40 border border-white/60 shadow-sm'}
          `}
        >
          {n === 'del' ? '⌫' : n}
        </button>
      ))}
      <div className="col-span-3 mt-4">
        <GlassButton 
          variant="primary"
          fullWidth
          onClick={onSubmit}
          disabled={!value || value === '0'}
          className="!py-5 !bg-black !text-lg !rounded-[2rem]"
        >
          Confirm Expense
        </GlassButton>
      </div>
    </div>
  );
};

const BottomNav = ({ currentView, onChange }: { currentView: ViewState, onChange: (v: ViewState) => void }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, icon: Home },
    { id: ViewState.ANALYTICS, icon: BarChart3 },
    { id: 'ADD', icon: Plus, isAction: true },
    { id: ViewState.SETTINGS, icon: Settings },
    { id: 'PROFILE', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-30">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]" />
        <div className="relative flex justify-between items-center px-6 py-4">
          {navItems.map((item) => {
            if (item.isAction) {
              return (
                <button 
                  key={item.id}
                  onClick={() => onChange(item.id as any)}
                  className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-900/20 active:scale-90 transition-transform -mt-8 border-4 border-[#F6F8FC]"
                >
                  <Plus size={28} />
                </button>
              );
            }
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.id !== 'PROFILE' && onChange(item.id as ViewState)}
                className={`flex flex-col items-center justify-center w-10 h-10 transition-colors ${isActive ? 'text-black' : 'text-slate-400'}`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-black rounded-full" />}
              </button>
            );
          })}
        </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // State
  const [state, setState] = useState<AppState>(loadState());
  const [view, setView] = useState<ViewState>(
    state.config.onboardingComplete ? ViewState.DASHBOARD : ViewState.ONBOARDING
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Persistence
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Derived Logic
  const today = new Date();
  const currentMonthKey = getCurrentMonthKey();
  const daysInMonth = getDaysInMonth(today);
  const currentDay = today.getDate();
  const daysRemaining = daysInMonth - currentDay + 1;

  const monthTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${d.getMonth()}` === currentMonthKey;
    });
  }, [state.transactions, currentMonthKey]);

  const totalSpentMonth = monthTransactions.reduce((acc, t) => acc + t.amount, 0);
  const remainingMonthly = state.config.monthlyLimit - totalSpentMonth;
  const spentToday = monthTransactions
    .filter(t => new Date(t.date).getDate() === currentDay)
    .reduce((acc, t) => acc + t.amount, 0);

  const budgetAvailableForTodayAndFuture = remainingMonthly + spentToday;
  const dailyTarget = budgetAvailableForTodayAndFuture / daysRemaining;
  const remainingToday = dailyTarget - spentToday;
  const isOverBudget = remainingToday < 0;
  
  const avgDaily = state.config.monthlyLimit / daysInMonth;

  // Handlers
  const handleSetBudget = (amount: number) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, monthlyLimit: amount, onboardingComplete: true }
    }));
    setView(ViewState.DASHBOARD);
  };

  const handleAddTransaction = () => {
    const amount = parseFloat(inputValue);
    if (isNaN(amount) || amount <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString(),
      note: 'Groceries',
      category: '🛍️'
    };

    setState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));
    
    setInputValue('');
    setShowAddModal(false);
  };

  const handleNavChange = (v: ViewState | 'ADD') => {
    if (v === 'ADD') {
      setShowAddModal(true);
    } else {
      setView(v);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all data?")) {
      clearState();
      setState(loadState());
      setView(ViewState.ONBOARDING);
    }
  };

  // --- Views ---

  const OnboardingView = () => {
    const [budgetInput, setBudgetInput] = useState('');

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="max-w-md w-full"
        >
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/80 to-white/20 backdrop-blur-xl border border-white/60 flex items-center justify-center shadow-2xl shadow-purple-200/50 mb-8 mx-auto">
             <Wallet className="w-10 h-10 text-purple-500" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-2 tracking-tight">Lume</h1>
          <p className="text-slate-500 mb-10 font-medium">Mindful spending, liquid clarity.</p>
          
          <GlassCard variant="glass" className="p-8">
            <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
              Monthly Goal
            </label>
            <div className="relative mb-8">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-medium text-slate-400">$</span>
              <input 
                type="number" 
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full bg-transparent border-b-2 border-slate-200/50 py-2 pl-8 text-5xl font-bold text-slate-800 focus:outline-none focus:border-purple-400 transition-colors placeholder-slate-200"
                placeholder="0"
              />
            </div>
            <GlassButton 
              fullWidth 
              onClick={() => handleSetBudget(Number(budgetInput))}
              disabled={!budgetInput}
            >
              Start Journey
            </GlassButton>
          </GlassCard>
        </motion.div>
      </div>
    );
  };

  const DashboardView = () => {
    // Mini Chart Data
    const chartData = [
      { name: 'Mon', val: 30 }, { name: 'Tue', val: 45 }, { name: 'Wed', val: 25 },
      { name: 'Thu', val: 60 }, { name: 'Fri', val: 40 }, { name: 'Sat', val: 75 }, { name: 'Sun', val: 50 }
    ];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen pb-32 px-6 pt-12"
      >
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-[1rem] bg-white/50 backdrop-blur-md border border-white/60 overflow-hidden shadow-sm p-1">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="rounded-[0.8rem]" />
             </div>
             <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Good Morning</p>
                <p className="text-xl font-bold text-slate-800">Alex</p>
             </div>
          </div>
          <button className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-sm text-slate-600 active:scale-95 transition-transform">
             <Bell size={20} />
          </button>
        </div>

        {/* Main Budget Card */}
        <GlassCard variant="featured" className="p-8 mb-8 relative text-slate-900 min-h-[220px] flex flex-col justify-between">
           <div className="flex justify-between items-start relative z-10">
              <div>
                 <p className="text-slate-600 font-medium text-sm mb-2">Available Daily</p>
                 <h2 className="text-5xl font-bold tracking-tighter">{formatCurrency(remainingToday, state.config.currencySymbol)}</h2>
              </div>
              <div className="bg-white/40 backdrop-blur-md pl-3 pr-4 py-1.5 rounded-full flex items-center gap-2 border border-white/50">
                 <div className={`w-2 h-2 rounded-full ${isOverBudget ? 'bg-red-400' : 'bg-green-400'}`} />
                 <span className="text-xs font-bold text-slate-700">{isOverBudget ? 'Over' : 'On Track'}</span>
              </div>
           </div>

           <div className="flex items-end justify-between relative z-10 mt-6">
              <div>
                 <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Monthly Goal</p>
                 <p className="font-bold text-xl text-slate-800 opacity-80">{formatCurrency(state.config.monthlyLimit, state.config.currencySymbol)}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-lg shadow-purple-900/5 text-slate-700">
                 <ArrowUpRight size={24} />
              </div>
           </div>

           {/* Decorative Elements */}
           <div className="absolute -right-12 -bottom-24 opacity-30 pointer-events-none mix-blend-overlay">
              <HaloRing size={320} strokeWidth={60} progress={0.65} color="white" trackColor="rgba(255,255,255,0.1)" />
           </div>
        </GlassCard>

        {/* Analytics Teaser */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
           <GlassCard variant="glass" className="min-w-[180px] p-5 flex-1">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-sm font-bold text-slate-700">Spending</span>
                 <span className="text-[10px] font-bold bg-white/40 px-2 py-1 rounded-full text-slate-500">WEEK</span>
              </div>
              <div className="h-24 w-full -ml-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <Bar dataKey="val" radius={[4, 4, 4, 4]}>
                          {chartData.map((e, i) => (
                             <Cell key={i} fill={i === 5 ? COLORS.pink : '#CBD5E1'} fillOpacity={i===5?1:0.5} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </GlassCard>
           
           <GlassCard variant="glass" className="min-w-[180px] p-5 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                 <div className="p-3 bg-green-100/50 backdrop-blur-sm text-green-600 rounded-2xl">
                    <Wallet size={20} />
                 </div>
              </div>
              <div>
                 <p className="text-3xl font-bold text-slate-800 mb-1">85%</p>
                 <p className="text-xs text-slate-400 font-bold uppercase">Budget Health</p>
              </div>
           </GlassCard>
        </div>

        {/* Recent Transactions */}
        <div className="flex justify-between items-center mb-5 px-1">
           <h3 className="font-bold text-xl text-slate-800">Recent</h3>
           <button className="text-sm text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full">See All</button>
        </div>
        
        <div className="space-y-3">
           {monthTransactions.slice(0, 5).map((tx) => (
              <GlassCard variant="white" key={tx.id} className="flex items-center justify-between p-4 !rounded-[1.5rem] !bg-white/60">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-xl shadow-sm border border-white">
                       {tx.category || '💸'}
                    </div>
                    <div>
                       <p className="font-bold text-slate-800 text-sm">{tx.note || 'Purchase'}</p>
                       <p className="text-xs text-slate-400 font-medium">{new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                 </div>
                 <span className="font-bold text-slate-800">-${tx.amount}</span>
              </GlassCard>
           ))}
           {monthTransactions.length === 0 && (
              <div className="text-center py-12 text-slate-400 bg-white/30 backdrop-blur-md rounded-[2rem] border border-dashed border-white/50">
                 No transactions yet
              </div>
           )}
        </div>
      </motion.div>
    );
  };

  const AnalyticsView = () => {
    // Generate simple daily data for the current month
    const dailyData: {day: number, amount: number}[] = [];
    for(let i=1; i<=daysInMonth; i++) {
        dailyData.push({ day: i, amount: 0 });
    }
    monthTransactions.forEach(t => {
      const d = new Date(t.date).getDate();
      if(dailyData[d-1]) dailyData[d-1].amount += t.amount;
    });

    return (
      <div className="min-h-screen pb-32 px-6 pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView(ViewState.DASHBOARD)} className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center border border-white/50">
             <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Statistics</h2>
          <div className="ml-auto w-10 h-10 rounded-full bg-white/40 flex items-center justify-center shadow-sm border border-white/50">
             <MoreHorizontal size={20} className="text-slate-500" />
          </div>
        </div>

        <GlassCard variant="glass" className="p-6 mb-6">
          <div className="flex items-center justify-between mb-8">
             <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Total Spent</p>
                <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalSpentMonth, state.config.currencySymbol)}</h3>
             </div>
             <div className="h-14 w-14 relative">
                <HaloRing size={56} strokeWidth={6} progress={totalSpentMonth/state.config.monthlyLimit} color={COLORS.pink} trackColor="rgba(0,0,0,0.05)" />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-600">
                   {Math.round((totalSpentMonth/state.config.monthlyLimit)*100)}%
                </span>
             </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} interval={4} />
                <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
                  {dailyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount > avgDaily * 1.5 ? COLORS.coral : COLORS.purple} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <h3 className="font-bold text-lg text-slate-800 mb-4 px-1">Categories</h3>
        <div className="space-y-3">
           {['Shopping', 'Food', 'Transport', 'Entertainment'].map((cat, i) => (
              <GlassCard variant="white" key={cat} className="flex items-center justify-between p-4 !rounded-[1.5rem] !bg-white/50">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/60 shadow-sm ${
                       i === 0 ? 'bg-pink-50 text-pink-500' :
                       i === 1 ? 'bg-orange-50 text-orange-500' :
                       i === 2 ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                    }`}>
                       {i===0 ? <ShoppingBag size={20} /> : i===1 ? <Coffee size={20} /> : <div className="w-5 h-5 bg-current rounded-full opacity-50" />}
                    </div>
                    <div className="flex-1">
                       <p className="font-bold text-slate-700 text-sm">{cat}</p>
                       <div className="w-24 h-1.5 bg-slate-200/50 rounded-full mt-2 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${80 - i*20}%`, backgroundColor: i===0?COLORS.pink : i===1?COLORS.coral : COLORS.blue }} />
                       </div>
                    </div>
                 </div>
                 <span className="font-bold text-slate-800">${(120 - i*25).toFixed(0)}</span>
              </GlassCard>
           ))}
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    return (
      <div className="min-h-screen px-6 pt-12 pb-32">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Settings</h2>
        
        <GlassCard variant="glass" className="p-6 mb-8">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 border border-white/50 shadow-md overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
              </div>
              <div>
                 <p className="font-bold text-xl text-slate-800">Alex Designer</p>
                 <p className="text-sm text-slate-400 font-medium">Pro Member</p>
              </div>
           </div>
           
           <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-white/40 border border-white/40 rounded-2xl hover:bg-white/60 transition-colors">
                 <span className="font-medium text-slate-700">Monthly Budget</span>
                 <span className="font-bold text-slate-900">{formatCurrency(state.config.monthlyLimit, state.config.currencySymbol)}</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/40 border border-white/40 rounded-2xl hover:bg-white/60 transition-colors">
                 <span className="font-medium text-slate-700">Currency</span>
                 <span className="font-bold text-slate-900">USD ($)</span>
              </button>
           </div>
        </GlassCard>

        <GlassButton variant="danger" fullWidth onClick={handleReset} className="!bg-red-50/80 !border-red-100">
           Reset All Data
        </GlassButton>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen text-slate-800 font-sans selection:bg-purple-200 overflow-x-hidden">
      <BackgroundMesh />
      
      <AnimatePresence mode='wait'>
        {view === ViewState.ONBOARDING ? (
          <motion.div key="onboarding" className="absolute inset-0 z-50 bg-[#F1F5F9]/20 backdrop-blur-sm">
            <OnboardingView />
          </motion.div>
        ) : (
          <div className="relative z-10">
            {view === ViewState.DASHBOARD && <DashboardView />}
            {view === ViewState.ANALYTICS && <AnalyticsView />}
            {view === ViewState.SETTINGS && <SettingsView />}
            <BottomNav currentView={view} onChange={handleNavChange} />
          </div>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4"
            >
               <GlassCard variant="white" className="p-8 pb-10 !rounded-[2.5rem] shadow-2xl shadow-purple-900/10">
                 <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
                 <div className="text-center mb-6">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Add Expense</p>
                   <div className="flex items-center justify-center gap-1">
                     <span className="text-4xl text-slate-300 font-medium">$</span>
                     <span className="text-7xl font-bold text-slate-800 tracking-tighter">
                       {inputValue || '0'}
                     </span>
                   </div>
                 </div>
                 
                 <NumberPad 
                   value={inputValue}
                   onInput={(n) => setInputValue(prev => prev + n.toString())}
                   onDelete={() => setInputValue(prev => prev.slice(0, -1))}
                   onSubmit={handleAddTransaction}
                 />
               </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
