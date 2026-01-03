
import React, { useState } from 'react';
import { X, Check, ShieldCheck, Sparkles, Zap, ChevronRight, AlertTriangle } from 'lucide-react';
import { COLORS, SUBSCRIPTION_PRODUCTS, STRIPE_CONFIG } from '../constants';
import { UserTier } from '../types';

interface PaywallProps {
  onClose: () => void;
  onSubscribe: (tier: UserTier, monthly: boolean) => void;
  darkMode?: boolean;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onSubscribe, darkMode }) => {
  const [isYearly, setIsYearly] = useState(true);

  const cardClass = darkMode ? 'bg-[#2D2D2D] text-white' : 'bg-white text-black';
  const subTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col screen-enter ${darkMode ? 'bg-[#1A1A1A]' : 'bg-[#8FAD9C]'}`}>
      {STRIPE_CONFIG.MODE === 'test' && (
        <div className="bg-[#D4A5A5] text-black py-1 text-center font-bold text-[8px] uppercase tracking-widest">
          Test Mode Active
        </div>
      )}
      <header className="p-6 flex justify-between items-center shrink-0">
        <button onClick={onClose} className="p-2 bg-black/10 rounded-full text-white">
          <X size={24} />
        </button>
        <button onClick={() => alert("Restoring...")} className="font-lexend font-bold text-sm uppercase tracking-widest opacity-60">Restore</button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-12 space-y-8">
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 bg-[#D4A5A5]/20 px-4 py-1.5 rounded-full">
            <Sparkles size={16} className="text-[#D4A5A5]" />
            <span className="font-lexend font-bold text-xs uppercase tracking-widest text-[#D4A5A5]">Premium Access</span>
          </div>
          <h1 className="font-lexend font-bold text-3xl leading-tight">Unlock Infinite Clarity</h1>
          <p className="font-opendyslexic text-base opacity-70">Upgrade to keep translating the world after your 5 free analyses.</p>
        </div>

        <div className="flex justify-center">
          <div className={`p-1 rounded-full flex items-center gap-1 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
            <button 
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-lexend font-bold text-sm transition-all ${!isYearly ? 'bg-white shadow-sm text-black' : 'opacity-40'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-lexend font-bold text-sm transition-all flex items-center gap-2 ${isYearly ? 'bg-white shadow-sm text-black' : 'opacity-40'}`}
            >
              Yearly
              <span className="text-[10px] bg-[#5B4A8F] text-white px-2 py-0.5 rounded-md">-17%</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Plus Tier */}
          <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${cardClass} border-transparent shadow-xl`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-lexend font-bold text-2xl">WTM Plus</h3>
                <p className={`text-xs ${subTextClass}`}>Essential daily decoding</p>
              </div>
              <div className="text-right">
                <p className="font-lexend font-bold text-2xl">{isYearly ? SUBSCRIPTION_PRODUCTS.PLUS_YEARLY.price : SUBSCRIPTION_PRODUCTS.PLUS_MONTHLY.price}</p>
                <p className={`text-[10px] uppercase font-bold ${subTextClass}`}>per {isYearly ? 'year' : 'month'}</p>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {['Unlimited analyses', 'Image & Screenshot support', 'History backup'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 font-opendyslexic text-xs">
                  <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"><Check size={10} className="text-green-500" /></div>
                  {feat}
                </li>
              ))}
            </ul>
            <button onClick={() => onSubscribe(UserTier.PLUS, !isYearly)} className="w-full h-14 bg-[#5B4A8F] text-white font-lexend font-bold rounded-2xl shadow-lg active:scale-95 transition-all">Start Plus Plan</button>
          </div>

          {/* Pro Tier */}
          <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${darkMode ? 'bg-[#5B4A8F] text-white' : 'bg-black text-white'} border-transparent shadow-xl relative overflow-hidden`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-lexend font-bold text-2xl flex items-center gap-2">WTM Pro <ShieldCheck size={20} className="text-[#D4A5A5]" /></h3>
                <p className="text-xs opacity-70">Complete social mastery</p>
              </div>
              <div className="text-right">
                <p className="font-lexend font-bold text-2xl">{isYearly ? SUBSCRIPTION_PRODUCTS.PRO_YEARLY.price : SUBSCRIPTION_PRODUCTS.PRO_MONTHLY.price}</p>
                <p className="text-[10px] uppercase font-bold opacity-70">per {isYearly ? 'year' : 'month'}</p>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {['Everything in Plus', 'Real-time voice analysis', 'Coaching sessions'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 font-opendyslexic text-xs">
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center"><Check size={10} className="text-white" /></div>
                  {feat}
                </li>
              ))}
            </ul>
            <button onClick={() => onSubscribe(UserTier.PRO, !isYearly)} className="w-full h-14 bg-white text-black font-lexend font-bold rounded-2xl shadow-lg active:scale-95 transition-all">Start Pro Plan</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Paywall;
