
import React from 'react';
import { ClarityScore } from '../types';

interface RiskMeterProps {
  score: ClarityScore;
  darkMode?: boolean;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score, darkMode }) => {
  const percentage = (score.score / 5) * 100;
  
  const getGradient = () => {
    if (score.score <= 1) return 'bg-green-500';
    if (score.score <= 2) return 'bg-blue-400';
    if (score.score <= 3) return 'bg-[#B5838D]'; // Muted Berry/Rose instead of Yellow
    if (score.score <= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full space-y-3 p-6 rounded-2xl border-2 ${darkMode ? 'bg-[#2D2D2D] border-white/5' : 'bg-white border-slate-100'}`}>
      <div className="flex justify-between items-end">
        <div>
          <h3 className={`font-lexend font-bold text-xl ${darkMode ? 'text-white' : 'text-black'}`}>Clarity Score</h3>
          <p className="font-opendyslexic text-sm opacity-50">1 = Clear, 5 = Ambiguous</p>
        </div>
        <div className={`text-3xl font-lexend font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
          {score.score}<span className="opacity-30 text-lg">/5</span>
        </div>
      </div>
      
      <div className={`h-4 w-full rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
        <div 
          className={`h-full ${getGradient()} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className={`font-opendyslexic text-base leading-relaxed italic opacity-90 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        "{score.explanation}"
      </p>
    </div>
  );
};

export default RiskMeter;
