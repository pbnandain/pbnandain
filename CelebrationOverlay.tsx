
import React, { useEffect } from 'react';

interface CelebrationOverlayProps {
  amount: number;
  isVisible: boolean;
  onComplete: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ amount, isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fadeIn" />
      <div className="relative bg-white rounded-[40px] p-12 shadow-2xl border border-white/20 text-center animate-rewardPop max-w-sm w-full pointer-events-auto">
        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-5xl mx-auto mb-8 shadow-lg shadow-orange-200 animate-bounce">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Shubham!</h2>
        <p className="text-slate-500 mb-6 font-medium">Task successfully completed</p>
        <div className="bg-orange-50 inline-block px-8 py-4 rounded-3xl border border-orange-100 mb-2">
          <span className="text-sm text-orange-400 font-bold uppercase tracking-wider block mb-1">Earned</span>
          <span className="text-5xl font-black text-orange-600 animate-pulse">+{amount.toLocaleString('en-IN')} COIN</span>
        </div>
        <p className="text-xs text-slate-400 mt-6 uppercase tracking-widest font-bold">Balance Updated</p>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
