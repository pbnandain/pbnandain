
import React from 'react';

interface MechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MechanicsModal: React.FC<MechanicsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fadeIn" 
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl animate-scaleIn border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-xl shadow-lg">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Professional Workdesk</h2>
              <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em]">P2P Mandate Policy v7.0</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 md:p-12 overflow-y-auto space-y-10 custom-scrollbar">
          {/* BID Section */}
          <div className="bg-orange-50 border border-orange-100 p-8 rounded-[32px] flex gap-6">
            <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl shadow-lg">
              <i className="fa-solid fa-gavel"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-orange-900 mb-1">Reverse Auction Execution</h3>
              <p className="text-sm text-orange-700 leading-relaxed font-medium">
                Mandates are awarded based on professional efficiency. Participants bid the minimum amount they are willing to accept for a task. The lowest bid wins the opportunity to fulfill and earn.
              </p>
            </div>
          </div>

          {/* AWARD Section */}
          <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[32px] flex gap-6">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl shadow-lg">
              <i className="fa-solid fa-file-signature"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-indigo-900 mb-1">Offerer Authority</h3>
              <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                Every task is launched by a Peer Offerer. Only the Offerer has the authority to review bids and award the mandate to a participant. Selection is based on bid value and reputation.
              </p>
            </div>
          </div>

          {/* SETTLEMENT Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex gap-6 text-white">
            <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl border border-white/20">
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div>
              <h3 className="text-lg font-black mb-1">Verified Settlement</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Payments are held in Escrow once a mandate is awarded. COINs (1:1 INR) are released to the Fulfiller only after the Offerer verifies delivery of the practical deliverables.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex-shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl"
          >
            Enter Professional Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default MechanicsModal;
