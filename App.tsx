
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { UserProfile, Task, Transaction, TransactionType, Bid, TaskStatus } from './types';
import Dashboard from './pages/Dashboard';
import Auctions from './pages/Auctions';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import CreateTask from './pages/CreateTask';
import TaskDetail from './pages/TaskDetail';
import LoginPage from './pages/Login';
import AdminAuditPanel from './pages/AdminAuditPanel';
import PublicDirectory from './pages/PublicDirectory';
import BiddingPolicy from './pages/BiddingPolicy';
import CelebrationOverlay from './components/CelebrationOverlay';
import MechanicsModal from './components/MechanicsModal';
import AIHelpAssistant from './components/AIHelpAssistant';
import { cloud } from './services/cloudService';
import { getAIStatus } from './services/geminiService';

const STORAGE_KEYS = {
  USER: 'hn_coin_user'
};

interface NavbarProps {
  user: UserProfile;
  tasks: Task[];
  onOpenMechanics: () => void;
  onRestoreSync: () => void;
  isSyncing: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  tasks,
  onOpenMechanics, 
  onRestoreSync,
  isSyncing
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [aiLimited, setAiLimited] = useState(false);

  useEffect(() => {
    const aiCheck = setInterval(() => {
      setAiLimited(getAIStatus());
    }, 5000);
    return () => clearInterval(aiCheck);
  }, []);

  return (
    <nav className="fixed bottom-0 md:top-0 md:bottom-auto w-full glass border-t md:border-t-0 md:border-b border-orange-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center bg-[#FF9933] text-white font-black text-[10px] w-10 h-10 rounded-full shadow-lg border-2 border-white/20 group-hover:scale-110 transition-all">
                COIN
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent leading-none">
                  Hindu Network
                </span>
                <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest mt-1">
                  Professional Task Desk
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-1 ml-2">
              <div 
                className={`w-2 h-2 rounded-full ${aiLimited ? 'bg-amber-500 animate-pulse' : 'bg-green-500'} border border-white shadow-sm`}
                title={aiLimited ? "Intelligence Core Resting" : "Opportunity Engine Online"}
              ></div>
              <button 
                onClick={onRestoreSync}
                className={`w-7 h-7 bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 rounded-full flex items-center justify-center transition-all border border-slate-200 ${isSyncing ? 'animate-spin' : ''}`}
                title="Sync Network Data"
              >
                <i className="fa-solid fa-rotate text-[10px]"></i>
              </button>
              {user.isAdmin && (
                <Link 
                  to="/admin/audit"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border ${isActive('/admin/audit') ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-indigo-600'}`}
                  title="Host Audit Panel"
                >
                  <i className="fa-solid fa-shield-halved text-[10px]"></i>
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-1 justify-around md:justify-end md:gap-6 items-center">
            {[
              { path: '/', icon: 'fa-house', label: 'Home' },
              { path: '/auctions', icon: 'fa-gavel', label: 'Auction Desk' },
              { path: '/billing', icon: 'fa-wallet', label: 'Wallet' },
              { path: '/profile', icon: 'fa-user-gear', label: 'Settings' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-1.5 rounded-xl transition-all ${
                  isActive(item.path) ? 'text-orange-600 bg-orange-50' : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50/50'
                }`}
              >
                <i className={`fa-solid ${item.icon}`}></i>
                <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [celebration, setCelebration] = useState<{ isVisible: boolean; amount: number; message: string }>({ isVisible: false, amount: 0, message: 'Reward' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMechanicsOpen, setIsMechanicsOpen] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  
  const userRef = useRef<UserProfile | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSessionSeconds(0);
      return;
    }

    const timer = setInterval(async () => {
      setSessionSeconds(prev => {
        const next = prev + 1;
        if (next % 100 === 0 && userRef.current) {
          chargeUsageFee(userRef.current.id);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.id]);

  const chargeUsageFee = async (userId: string) => {
    const success = await cloud.collectLoginFee(userId);
    if (success) {
      syncGlobalData();
    }
  };

  const syncGlobalData = async () => {
    setIsSyncing(true);
    await cloud.autoAwardExpiredAuctions();
    const globalTasks = await cloud.fetchGlobalTasks();
    setTasks(globalTasks);
    
    if (userRef.current) {
      const cloudUser = await cloud.fetchUserProfile(userRef.current.id);
      if (cloudUser) {
        setUser(prev => prev ? { ...prev, ...cloudUser } : cloudUser);
      }
      const globalTxs = await cloud.fetchAllGlobalTransactions();
      const userTxs = globalTxs.filter(tx => tx.userId === userRef.current?.id);
      setTransactions(userTxs);
    }
    setTimeout(() => setIsSyncing(false), 800);
  };

  useEffect(() => {
    syncGlobalData();
    const interval = setInterval(syncGlobalData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [user]);

  const recordTransaction = (tx: Transaction) => {
    cloud.recordGlobalTransaction(tx);
    syncGlobalData();
  };

  const handleTaskCompletion = async (taskId: string, reward: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !user) return;

    if (user.balance < reward) {
       alert("Insufficient audited balance to pay for this task.");
       return;
    }

    await cloud.finalizeTask(taskId, reward);
    
    const newUser = { ...user, balance: user.balance - reward };
    setUser(newUser);
    await cloud.syncUserProfile(newUser);

    recordTransaction({ 
      id: `pay-${Date.now()}`, 
      userId: user.id, 
      userName: user.username, 
      date: new Date().toISOString().split('T')[0], 
      amount: reward, 
      type: TransactionType.TASK_PAYMENT, 
      description: `Payment for "${task.title}"`, 
      status: 'Completed' 
    });

    if (task.winnerId) {
      const winner = await cloud.fetchUserProfile(task.winnerId);
      if (winner) {
        winner.balance += reward;
        winner.completedTasks += 1;
        await cloud.syncUserProfile(winner);
        
        cloud.recordGlobalTransaction({
          id: `earn-${Date.now()}`,
          userId: winner.id,
          userName: winner.username,
          date: new Date().toISOString().split('T')[0],
          amount: reward,
          type: TransactionType.EARNING,
          description: `Earned from task "${task.title}"`,
          status: 'Completed'
        });
      }
    }

    setCelebration({ isVisible: true, amount: reward, message: 'Settlement Complete' });
    syncGlobalData();
  };

  const handleLogin = (userData: { name: string; email: string; isAdmin?: boolean }) => {
    const newUser: UserProfile = {
      id: 'u-' + Math.random().toString(36).substr(2, 5),
      username: userData.name,
      email: userData.email,
      balance: 0,
      completedTasks: 0,
      rating: 5.0,
      sessionSeconds: 0,
      totalLifetimeSeconds: 0,
      isAdmin: userData.isAdmin || false
    };

    setUser(newUser);
    cloud.syncUserProfile(newUser);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 md:pt-16 flex flex-col">
        {user && (
          <Navbar 
            user={user} 
            tasks={tasks}
            onOpenMechanics={() => setIsMechanicsOpen(true)}
            onRestoreSync={syncGlobalData}
            isSyncing={isSyncing}
          />
        )}
        <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
            <Routes>
              <Route path="/explore" element={<PublicDirectory />} />
              <Route path="/policy/bidding" element={<BiddingPolicy />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
              <Route path="/" element={user ? <Dashboard user={user} tasks={tasks} onComplete={handleTaskCompletion} onOpenPolicy={() => setIsMechanicsOpen(true)} sessionSeconds={sessionSeconds} /> : <Navigate to="/login" />} />
              <Route path="/auctions" element={user ? <Auctions tasks={tasks} onBid={async (id, amt) => {
                if (user.balance < 1) {
                  alert("You need a positive verified balance to participate in auctions.");
                  return;
                }
                await cloud.placeGlobalBid(id, { id: `b-${Date.now()}`, userId: user.id, userName: user.username, amount: amt, timestamp: Date.now() });
                syncGlobalData();
              }} awardTask={async (tid, wid, wname, amt) => {
                const task = tasks.find(t => t.id === tid);
                if (task) {
                  const updatedTask = { ...task, winnerId: wid, winnerName: wname, status: 'In Progress' as TaskStatus, highestBid: amt };
                  await cloud.syncTask(updatedTask);
                  syncGlobalData();
                }
              }} user={user} /> : <Navigate to="/login" />} />
              <Route path="/billing" element={user ? <Billing user={user} transactions={transactions} onTransaction={recordTransaction} onUserUpdate={setUser} /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <Profile user={user} tasks={tasks} transactions={transactions} onUpdateUser={setUser} onLogout={() => {setUser(null); localStorage.removeItem(STORAGE_KEYS.USER);}} /> : <Navigate to="/login" />} />
              <Route path="/create" element={user ? <CreateTask onAdd={async (t) => { await cloud.syncTask(t); syncGlobalData(); }} user={user} /> : <Navigate to="/login" />} />
              <Route path="/task/:taskId" element={user ? <TaskDetail tasks={tasks} onComplete={handleTaskCompletion} onStatusUpdate={async (tid, status) => {
                const task = tasks.find(t => t.id === tid);
                if (task) {
                   let winnerId = task.winnerId;
                   let winnerName = task.winnerName;
                   let highestBid = task.highestBid;

                   if (status === 'In Progress' && !winnerId) {
                      // If the owner is marking it 'In Progress' manually from the detail page
                      if (user.id === task.creatorId && task.bids && task.bids.length > 0) {
                         const sortedBids = [...task.bids].sort((a, b) => a.amount - b.amount);
                         winnerId = sortedBids[0].userId;
                         winnerName = sortedBids[0].userName;
                         highestBid = sortedBids[0].amount;
                      } else {
                         // Fallback or fulfiller manually accepting a direct mandate
                         winnerId = user.id;
                         winnerName = user.username;
                      }
                   }

                   const updated = { ...task, status, winnerId, winnerName, highestBid };
                   await cloud.syncTask(updated);
                   syncGlobalData();
                }
              }} onUpdateTask={() => {}} user={user} onBid={async (id, amt) => {
                await cloud.placeGlobalBid(id, { id: `b-${Date.now()}`, userId: user.id, userName: user.username, amount: amt, timestamp: Date.now() });
                syncGlobalData();
              }} /> : <Navigate to="/login" />} />
              {user?.isAdmin && <Route path="/admin/audit" element={<AdminAuditPanel />} />}
              {/* Legacy redirect */}
              <Route path="/marketplace" element={<Navigate to="/auctions" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </main>
        
        <footer className="mt-auto py-8 text-center text-slate-400">
          <div className="flex justify-center gap-6 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link to="/explore" className="hover:text-orange-600 transition-colors">Search Active Bids</Link>
            <Link to="/policy/bidding" className="hover:text-orange-600 transition-colors">Task Handbook</Link>
            <a href="http://coin.hindunetwork.co.in/privacy" className="hover:text-orange-600 transition-colors">Privacy</a>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-2 font-black">
            &copy; {new Date().getFullYear()} Hindu Network &bull; Reverse Auction Desk
          </div>
          <div className="text-[10px] text-orange-500 font-bold">AUDITED SETTLEMENTS • 1 COIN @ 100s PORTAL ACCESS</div>
        </footer>

        <CelebrationOverlay 
          amount={celebration.amount} 
          isVisible={celebration.isVisible} 
          onComplete={() => setCelebration({ ...celebration, isVisible: false })} 
        />
        <MechanicsModal isOpen={isMechanicsOpen} onClose={() => setIsMechanicsOpen(false)} />
        <AIHelpAssistant />
      </div>
    </Router>
  );
};

export default App;
