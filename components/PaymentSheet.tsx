
import React, { useState } from 'react';
import { X, CreditCard, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { COLORS } from '../constants';

interface PaymentSheetProps {
  productName: string;
  price: string;
  onCancel: () => void;
  onSuccess: () => void;
  darkMode?: boolean;
}

const PaymentSheet: React.FC<PaymentSheetProps> = ({ productName, price, onCancel, onSuccess, darkMode }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePay = () => {
    setStatus('PROCESSING');
    
    // Simulate API call
    setTimeout(() => {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard === '4242424242424242') {
        setStatus('SUCCESS');
        setTimeout(onSuccess, 1500);
      } else if (cleanCard === '4000000000000002') {
        setStatus('ERROR');
        setErrorMessage('Your card was declined.');
      } else {
        setStatus('ERROR');
        setErrorMessage('Invalid card number. Try 4242 4242 4242 4242 for success.');
      }
    }, 2000);
  };

  const cardBg = darkMode ? 'bg-[#2D2D2D]' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-black';

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-t-[2.5rem] p-8 space-y-8 shadow-2xl ${cardBg} animate-in slide-in-from-bottom duration-500`}>
        <div className="flex justify-between items-center">
          <h2 className={`font-lexend font-bold text-xl ${textPrimary}`}>Payment Details</h2>
          <button onClick={onCancel} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
            <X size={24} />
          </button>
        </div>

        <div className={`p-4 rounded-2xl border-2 border-[#5B4A8F]/20 ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
          <p className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1">Purchasing</p>
          <div className="flex justify-between items-center">
            <p className={`font-lexend font-bold ${textPrimary}`}>{productName}</p>
            <p className={`font-lexend font-bold text-lg text-[#5B4A8F]`}>{price}</p>
          </div>
        </div>

        {status === 'SUCCESS' ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
            <CheckCircle2 size={64} className="text-green-500" />
            <p className={`font-lexend font-bold text-xl ${textPrimary}`}>Payment Successful!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className={`w-full h-14 pl-12 pr-4 rounded-xl border-2 focus:border-[#5B4A8F] outline-none font-mono ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-black'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className={`w-full h-14 px-4 rounded-xl border-2 focus:border-[#5B4A8F] outline-none font-mono ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-black'}`}
                />
                <input
                  type="text"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className={`w-full h-14 px-4 rounded-xl border-2 focus:border-[#5B4A8F] outline-none font-mono ${darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-black'}`}
                />
              </div>
            </div>

            {status === 'ERROR' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 animate-in shake duration-300">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{errorMessage}</p>
              </div>
            )}

            <div className="flex items-center gap-2 opacity-40 justify-center">
              <Lock size={14} />
              <span className="text-[10px] uppercase font-bold tracking-widest">Secure encrypted payment</span>
            </div>

            <button
              disabled={status === 'PROCESSING'}
              onClick={handlePay}
              className="w-full h-16 bg-[#5B4A8F] text-white font-lexend font-bold rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {status === 'PROCESSING' ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Processing...
                </>
              ) : (
                `Pay ${price}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSheet;
