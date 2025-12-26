
import { Task, Bid, TaskStatus, UserProfile, Transaction, TransactionType } from "../types";

/**
 * CLOUD SYNCHRONIZATION BRIDGE
 * ----------------------------
 * This service is designed for Serverless backends (Firebase/Supabase/Node).
 * CURRENT MODE: Simulated Serverless (LocalStorage Persistence)
 * TO CONNECT REAL DB: Update the fetch() calls in the private methods.
 */
export class CloudStore {
  private static instance: CloudStore;
  private readonly TASKS_KEY = 'hn_global_market_tasks';
  private readonly USERS_KEY = 'hn_global_registry_users';
  private readonly TRANSACTIONS_KEY = 'hn_global_ledger';

  private constructor() {}

  public static getInstance(): CloudStore {
    if (!CloudStore.instance) {
      CloudStore.instance = new CloudStore();
    }
    return CloudStore.instance;
  }

  // --- IDENTITY & SYNC ---

  // Fix: authenticates users and ensures they exist in the registry
  async authenticateUser(profile: Partial<UserProfile>): Promise<UserProfile> {
    const users = this.getRaw(this.USERS_KEY) || [];
    let user = users.find((u: any) => u.email === profile.email);
    
    if (!user) {
      user = {
        id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        username: profile.username || 'Anonymous Professional',
        email: profile.email || '',
        balance: 10, // Starting bonus for new professionals
        completedTasks: 0,
        rating: 5.0,
        sessionSeconds: 0,
        totalLifetimeSeconds: 0,
        profilePic: profile.profilePic,
        isAdmin: profile.isAdmin || profile.email === 'pbnandain@gmail.com'
      };
      users.push(user);
      this.setRaw(this.USERS_KEY, users);
    }
    return user;
  }

  // Fix: added fetchAllUsers for AdminAuditPanel.tsx
  async fetchAllUsers(): Promise<UserProfile[]> {
    return this.getRaw(this.USERS_KEY) || [];
  }

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const users = this.getRaw(this.USERS_KEY) || [];
    return users.find((u: any) => u.id === userId) || null;
  }

  // Fix: added syncUserProfile for App.tsx and Profile.tsx
  async syncUserProfile(user: UserProfile): Promise<void> {
    const users = await this.fetchAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setRaw(this.USERS_KEY, users);
  }

  // --- TASK ENGINE ---

  async fetchGlobalTasks(): Promise<Task[]> {
    return this.getRaw(this.TASKS_KEY) || [];
  }

  // Fix: unified syncTask method to handle both creation and updates
  async syncTask(task: Task): Promise<void> {
    const tasks = await this.fetchGlobalTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
    } else {
      tasks.unshift(task);
    }
    this.setRaw(this.TASKS_KEY, tasks);
  }

  async publishTask(task: Task): Promise<void> {
    return this.syncTask(task);
  }

  async syncTaskUpdate(task: Task): Promise<void> {
    return this.syncTask(task);
  }

  // Fix: added placeGlobalBid for reverse auction bidding
  async placeGlobalBid(taskId: string, bid: Bid): Promise<void> {
    const tasks = await this.fetchGlobalTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.bids = [bid, ...(task.bids || [])];
      task.highestBid = bid.amount;
      task.bidCount = task.bids.length;
      await this.syncTaskUpdate(task);
    }
  }

  async submitBid(taskId: string, bid: Bid): Promise<void> {
    return this.placeGlobalBid(taskId, bid);
  }

  // Fix: added finalizeTask for settling completed tasks
  async finalizeTask(taskId: string, reward: number): Promise<void> {
    const tasks = await this.fetchGlobalTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'Completed';
      task.isCompleted = true;
      await this.syncTaskUpdate(task);
    }
  }

  // Fix: added cancelDeal for admin task management
  async cancelDeal(taskId: string, reason: string): Promise<void> {
    const tasks = await this.fetchGlobalTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'Cancelled';
      await this.syncTaskUpdate(task);
    }
  }

  // Fix: added autoAwardExpiredAuctions to automatically manage timed auctions
  async autoAwardExpiredAuctions(): Promise<void> {
    const tasks = await this.fetchGlobalTasks();
    const now = Date.now();
    let changed = false;

    for (const task of tasks) {
      if (task.isAuction && task.status === 'Open' && task.auctionEndTime && task.auctionEndTime < now) {
        if (task.bids && task.bids.length > 0) {
          const sortedBids = [...task.bids].sort((a, b) => a.amount - b.amount);
          task.status = 'Awarded';
          task.winnerId = sortedBids[0].userId;
          task.winnerName = sortedBids[0].userName;
          task.highestBid = sortedBids[0].amount;
        } else {
          task.status = 'Cancelled';
        }
        changed = true;
      }
    }

    if (changed) {
      this.setRaw(this.TASKS_KEY, tasks);
    }
  }

  // --- EARN & LEARN POLICY (LOGIN FEE) ---

  // Fix: renamed from processNetworkUsageFee to collectLoginFee to match App.tsx
  async collectLoginFee(userId: string): Promise<boolean> {
    const users = this.getRaw(this.USERS_KEY) || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    if (userIndex === -1 || users[userIndex].isAdmin) return false;

    if (users[userIndex].balance >= 1) {
      users[userIndex].balance -= 1;
      this.setRaw(this.USERS_KEY, users);
      
      await this.recordGlobalTransaction({
        id: `fee-${Date.now()}`,
        userId: userId,
        userName: users[userIndex].username,
        date: new Date().toISOString(),
        amount: 1,
        type: TransactionType.LOGIN_FEE,
        description: "Network Maintenance Access Fee (Earn & Learn Policy)",
        status: 'Completed'
      });
      return true;
    }
    return false;
  }

  // --- LEDGER ---

  // Fix: renamed to recordGlobalTransaction for ledger tracking in App.tsx
  async recordGlobalTransaction(tx: Transaction): Promise<void> {
    const txs = this.getRaw(this.TRANSACTIONS_KEY) || [];
    this.setRaw(this.TRANSACTIONS_KEY, [tx, ...txs]);
  }

  async recordTransaction(tx: Transaction): Promise<void> {
    return this.recordGlobalTransaction(tx);
  }

  async fetchUserTransactions(userId: string): Promise<Transaction[]> {
    const all = await this.fetchAllGlobalTransactions();
    return all.filter((tx: any) => tx.userId === userId);
  }

  // Fix: added fetchAllGlobalTransactions for global ledger audit
  async fetchAllGlobalTransactions(): Promise<Transaction[]> {
    return this.getRaw(this.TRANSACTIONS_KEY) || [];
  }

  // Fix: added approveTransaction for admin financial oversight
  async approveTransaction(txId: string): Promise<void> {
    const txs = await this.fetchAllGlobalTransactions();
    const tx = txs.find(t => t.id === txId);
    if (tx && tx.status === 'Pending') {
      tx.status = 'Completed';
      
      if (tx.type === TransactionType.DEPOSIT && tx.userId) {
        const user = await this.fetchUserProfile(tx.userId);
        if (user) {
          user.balance += tx.amount;
          await this.syncUserProfile(user);
        }
      }
      
      this.setRaw(this.TRANSACTIONS_KEY, txs);
    }
  }

  // Fix: added rejectTransaction for admin financial oversight
  async rejectTransaction(txId: string): Promise<void> {
    const txs = await this.fetchAllGlobalTransactions();
    const tx = txs.find(t => t.id === txId);
    if (tx && tx.status === 'Pending') {
      tx.status = 'Failed';
      this.setRaw(this.TRANSACTIONS_KEY, txs);
    }
  }

  // --- HELPERS (Simulating Database Access) ---

  private getRaw(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private setRaw(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const cloud = CloudStore.getInstance();
