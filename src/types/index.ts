export type AppStatus = 'no_app' | 'third_party_only' | 'outdated_app' | 'demo_ready';

export interface GymLead {
  id: string;
  name: string;
  website: string;
  contactEmail: string;
  contactName?: string;
  phone?: string;
  city: string;
  state: string;
  studioType: 'Athletic Club' | 'CrossFit Box' | 'Pilates & Yoga' | 'Boxing & HIIT';
  appStatus: AppStatus;
  demoSlug?: string;
  demoUrl?: string;
  notes?: string;
  lastUpdated?: string;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  avatar: string;
  bio: string;
  rate: number;
  rating: number;
  sessionsCompleted: number;
}

export interface GymClass {
  id: string;
  name: string;
  time: string;
  duration: string;
  instructor: string;
  instructorAvatar?: string;
  room: string;
  category: string; // Dynamic category (e.g. HIIT, Strength, WOD, Reformer, Flow, etc.)
  spotsLeft: number;
  totalSpots: number;
  day: string;
  intensity: 'Medium' | 'High' | 'Extreme' | 'All Levels';
  isBooked?: boolean;
}

export interface RewardTier {
  id: string;
  title: string;
  reqWorkouts: number;
  description: string;
  unlocked: boolean;
  code: string;
  icon: 'shake' | 'discount' | 'towel' | 'pt' | 'trophy';
}

export interface GymFeatures {
  classBooking: boolean;
  trainerScheduler: boolean;
  loyaltyPunchCard: boolean;
  pushNotification: boolean;
  passPurchase: boolean;
}

export interface AgencySettings {
  agencyName: string;
  calBookingUrl: string;
  repName: string;
  repTitle: string;
  repEmail: string;
  repPhone: string;
}

export interface HomeSectionConfig {
  greeting: string;
  memberBadge: string;
  membershipCardTitle: string;
  quickAction1Label?: string;
  quickAction2Label?: string;
  quickAction3Label?: string;
  featuredClassBadge?: string;
}

export interface ScheduleSectionConfig {
  title: string;
  subtitle: string;
  categories: string[];
  confirmationToast?: string;
}

export interface TrainersSectionConfig {
  title: string;
  subtitle: string;
}

export interface RewardsSectionConfig {
  title: string;
  subtitle: string;
  tierBadge: string;
  monthlyGoal: number;
  startingStreak?: number;
}

export interface GymConfig {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string;
  primaryColor: string;
  secondaryColor?: string;
  isDarkMode: boolean;
  logoUrl?: string;
  logoMonogram?: string;
  industryType: 'Athletic Club' | 'CrossFit Box' | 'Pilates & Yoga' | 'Boxing & HIIT';
  features: GymFeatures;
  trainers: Trainer[];
  classes: GymClass[];
  rewards: RewardTier[];
  agencySettings: AgencySettings;
  customPushMessage?: string;
  attachedLeadId?: string;
  // Deep section-specific configurations
  homeConfig?: HomeSectionConfig;
  scheduleConfig?: ScheduleSectionConfig;
  trainersConfig?: TrainersSectionConfig;
  rewardsConfig?: RewardsSectionConfig;
}

export type ActivePhoneTab = 'home' | 'schedule' | 'trainers' | 'rewards';
