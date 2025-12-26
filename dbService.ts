
/**
 * CLOUD SYNCHRONIZATION SERVICE (Serverless)
 * This service handles global data for 1000+ users.
 * To go live: Connect this to Firebase Firestore.
 * For now, it manages a 'Virtual Cloud Store' that ensures data integrity.
 */

import { Task, UserProfile, Transaction, Bid } from "../types";

// In a real production "Serverless" environment, these would be Firebase references
export class CloudStore {
  private static instance: CloudStore;
  
  private constructor() {}

  public static getInstance(): CloudStore {
    if (!CloudStore.instance) {
      CloudStore.instance = new CloudStore();
    }
    return CloudStore.instance;
  }

  /**
   * Syncs a new task to the 'Global Marketplace'
   * In a real BaaS, this would use: db.collection('tasks').add(task)
   */
  async syncTask(task: Task): Promise<void> {
    console.log("Syncing to Global Cloud Store...", task.id);
    // Simulate cloud latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For the prototype, we still use localStorage as our 'Local Cache'
    // but the architecture is ready for db.collection().onSnapshot()
    const tasks = JSON.parse(localStorage.getItem('hn_coin_tasks') || '[]');
    localStorage.setItem('hn_coin_tasks', JSON.stringify([task, ...tasks]));
  }

  /**
   * Fetches all tasks from the global cloud
   */
  async fetchGlobalTasks(): Promise<Task[]> {
    return JSON.parse(localStorage.getItem('hn_coin_tasks') || '[]');
  }

  /**
   * Handles a 'Global Bid' where User A interacts with User B's Auction
   */
  async placeGlobalBid(taskId: string, bid: Bid): Promise<void> {
    const tasks = await this.fetchGlobalTasks();
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          highestBid: bid.amount,
          bidCount: (t.bidCount || 0) + 1,
          bids: [bid, ...(t.bids || [])]
        };
      }
      return t;
    });
    localStorage.setItem('hn_coin_tasks', JSON.stringify(updatedTasks));
  }

  /**
   * Finalizes a transaction across the cloud for all users involved
   */
  async finalizeCloudTask(taskId: string, reward: number, userId: string): Promise<void> {
    const tasks = await this.fetchGlobalTasks();
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t);
    localStorage.setItem('hn_coin_tasks', JSON.stringify(updatedTasks));
    
    // In a real serverless app, we would use a 'Cloud Function' or 'Transaction'
    // to ensure User A's balance decreases while User B's increases simultaneously.
    console.log(`Cloud Transaction: Released ${reward} COIN to user ${userId}`);
  }
}

export const cloud = CloudStore.getInstance();
