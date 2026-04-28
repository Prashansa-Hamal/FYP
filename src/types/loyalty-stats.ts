export interface LoyaltyPointsStats {
  summary: {
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    currentBalance: number;
    averagePointsPerUser: number;
    totalUsersWithPoints: number;
  };
  weeklyPoints: Array<{
    week: string;
    earned: number;
    redeemed: number;
    net: number;
  }>;
  monthlyPoints: Array<{
    month: string;
    earned: number;
    redeemed: number;
    net: number;
  }>;
  topUsers: Array<{
    userId: string;
    name: string;
    email: string;
    pointsEarned: number;
    pointsRedeemed: number;
    currentBalance: number;
  }>;
  pointsByCategory: Array<{
    category: string;
    points: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    userId: string;
    userName: string;
    points: number;
    type: string;
    description: string;
    createdAt: string;
    orderNumber?: string;
  }>;
  projections: {
    projectedPointsNextMonth: number;
    estimatedRedemptions: number;
    growthRate: number;
  };
}

export interface UserLoyaltyStats {
  summary: {
    totalEarned: number;
    totalRedeemed: number;
    currentBalance: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    nextTierPoints: number;
    progressToNextTier: number;
  };
  monthlyHistory: Array<{
    month: string;
    earned: number;
    redeemed: number;
    net: number;
  }>;
  recentTransactions: Array<{
    id: string;
    points: number;
    type: string;
    description: string;
    createdAt: string;
    orderNumber?: string;
  }>;
  rank: {
    position: number;
    totalUsers: number;
    percentile: number;
  };
}

export interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pointsEarned: number;
  pointsRedeemed: number;
  currentBalance: number;
  rank: number;
  avatar?: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  joinDate: string;
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    period: "week" | "month" | "year" | "all";
    topUsers: LeaderboardUser[];
    currentUserRank?: {
      rank: number;
      pointsEarned: number;
      totalUsers: number;
    };
    summary: {
      totalPointsEarned: number;
      totalUsers: number;
      averagePoints: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
