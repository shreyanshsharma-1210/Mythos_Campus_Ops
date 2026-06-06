
export interface HunterStats {
  intelligence: number; // [INT] Academics
  strength: number;     // [STR] Gym/Fitness
  social: number;       // [SOC] Social Connections
  karma: number;        // [KAR] Community Contribution
  willpower: number;    // [WIL] Focus/Meditation
}

export interface Buff {
  id: string;
  name: string;
  type: keyof HunterStats;
  multiplier: number;
  duration: string;
}

export interface HunterProfile {
  name: string;
  rank: string;
  level: number;
  exp: number;
  maxExp: number;
  stats: HunterStats;
  buffs: Buff[];
}

export interface Quest {
  id: string;
  type: 'DAILY' | 'URGENT' | 'MAIN' | 'WORLD';
  title: string;
  subtitle?: string;
  description?: string;
  duration?: string;
  deadline?: string;
  reward?: string;
  isUrgent?: boolean;
  status: 'active' | 'accepted' | 'completed';
}
