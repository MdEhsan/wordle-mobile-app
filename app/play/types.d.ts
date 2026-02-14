export type UIMode = "SINGLE" | "MULTIPLAYER";

export interface StartGameResponse {
  gameId: string;
  mode: UIMode;
}

export interface GameStatsResponse {
  success: boolean;
  data: {
    username: string;
    stats: {
      totalGames: number;
      totalWins: number;
      totalLosses: number;
      winPercentage: number;
      currentStreak: number;
      bestStreak: number;
      eloRating: number;
    };
  };
}

export type StatsCardProps = {
  label: string;
  value: string | number;
};
