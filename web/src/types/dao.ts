export interface Member {
  address: string;
  name: string;
  reputation: number;
  roomNumber?: string;
  startDate: Date;
  endDate: Date;
  roles: string[];
  contributionScore: number;
}

export interface Room {
  id: string;
  number: string;
  size: number;
  price: number;
  available: boolean;
  currentMember?: string;
  amenities: string[];
  images: string[];
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  creator: string;
  createdAt: Date;
  deadline: Date;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votes: {
    for: number;
    against: number;
    abstain: number;
  };
  type: 'membership' | 'budget' | 'rules' | 'other';
  requiredReputation: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'completed';
  reputationReward: number;
  skills: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  organizer: string;
  participants: string[];
  maxParticipants?: number;
  type: 'community' | 'workshop' | 'social' | 'other';
}

export interface Budget {
  total: number;
  allocated: number;
  categories: {
    [key: string]: {
      amount: number;
      spent: number;
    };
  };
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  approvedBy: string[];
  status: 'pending' | 'approved' | 'rejected' | 'executed';
}

export interface Application {
  id: string;
  applicant: {
    name: string;
    email: string;
    profession: string;
    bio: string;
  };
  submittedAt: Date;
  status: 'pending' | 'interview' | 'accepted' | 'rejected';
  preferredDuration: number;
  startDate: Date;
  documents: {
    type: string;
    url: string;
  }[];
  votes: {
    member: string;
    vote: 'for' | 'against';
    comment?: string;
  }[];
}
