
export enum TransactionType {
  EARNING = 'EARNING',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BID_HOLD = 'BID_HOLD',
  TASK_PAYMENT = 'TASK_PAYMENT',
  SESSION_MINING = 'SESSION_MINING',
  LOGIN_FEE = 'LOGIN_FEE'
}

export interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: number;
}

export type SelectionMethod = 'Manual' | 'Automatic';
export type TaskStatus = 'Open' | 'In Progress' | 'Evaluating' | 'Awarded' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'Basic' | 'Intermediate' | 'High-Value';
  estimatedTime: string;
  creatorId: string;
  creatorName?: string;
  isAuction: boolean;
  selectionMethod?: SelectionMethod;
  status: TaskStatus;
  highestBid?: number;
  bidCount?: number;
  bids?: Bid[];
  winnerId?: string;
  winnerName?: string;
  auctionEndTime?: number;
  deadline?: number;
  createdAt: number;
  isCompleted?: boolean;
}

export interface Transaction {
  id: string;
  userId?: string; 
  userName?: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
  utr?: string; 
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  completedTasks: number;
  rating: number;
  sessionSeconds: number;
  totalLifetimeSeconds: number;
  isAdmin?: boolean; 
  profilePic?: string;
}
