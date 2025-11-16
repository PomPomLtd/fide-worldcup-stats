// TypeScript type definitions for FIDE World Cup statistics
// Generated from public/stats/round-N-stats.json structure

// ============================================================================
// CORE STATISTICS TYPES
// ============================================================================

export interface GameReference {
  white: string;
  black: string;
  result: string;
  gameId: string;
}

export interface AwardWithGame extends GameReference {
  moves: number;
  winner?: string;
}

export interface AwardWithCaptures extends GameReference {
  captures: number;
}

export interface AwardWithMoves extends GameReference {
  moves: number;
}

// ============================================================================
// OVERVIEW STATISTICS
// ============================================================================

export interface OverviewStats {
  totalGames: number;
  totalMoves: number;
  averageGameLength: number;
  longestGame: GameReference & { moves: number };
  shortestGame: GameReference & { moves: number };
}

// ============================================================================
// RESULTS STATISTICS
// ============================================================================

export interface ResultsStats {
  totalGames: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  whiteWinPercentage: number;
  blackWinPercentage: number;
  drawPercentage: number;
  decisivePercentage: number;
}

// ============================================================================
// MATCH STATISTICS (FIDE-Specific)
// ============================================================================

export interface MatchStats {
  totalMatches: number;
  decidedInClassical: number;
  decidedInRapidTier1: number;
  decidedInRapidTier2: number;
  decidedInBlitzTier1: number;
  decidedInBlitzTier2: number;
  decidedInArmageddon: number;
  tiebreakAnalysis: {
    classicalDecisiveRate: number;
    wentToTiebreak: number;
    tiebreakRate: number;
    rapidTier1NeededRate: number;
    rapidTier2Needed: number;
    blitzNeeded: number;
  };
  averageMovesToDecision: {
    classical?: number;
    rapidTier1?: number;
    rapidTier2?: number;
    blitzTier1?: number;
    blitzTier2?: number;
  };
}

// ============================================================================
// TACTICS STATISTICS
// ============================================================================

export interface TacticsStats {
  totalCaptures: number;
  averageCapturesPerGame: number;
  enPassantGames: Array<{
    white: string;
    black: string;
    count: number;
  }>;
  totalPromotions: number;
  promotionTypes: {
    queen: number;
    rook: number;
    bishop: number;
    knight: number;
  };
  castling: {
    kingsideCastles: number;
    queensideCastles: number;
    bothSidesCastled: number;
  };
  bloodiestGame: AwardWithCaptures | null;
  quietestGame: AwardWithCaptures | null;
}

// ============================================================================
// PIECE STATISTICS
// ============================================================================

export interface PieceStats {
  capturesByPiece: {
    pawn: number;
    knight: number;
    bishop: number;
    rook: number;
    queen: number;
  };
  mostActivePiece: {
    type: string;
    captures: number;
  };
  pieceActivity: {
    pawn: { moves: number; captures: number };
    knight: { moves: number; captures: number };
    bishop: { moves: number; captures: number };
    rook: { moves: number; captures: number };
    queen: { moves: number; captures: number };
    king: { moves: number; captures: number };
  };
}

// ============================================================================
// CHECKMATE STATISTICS
// ============================================================================

export interface CheckmateStats {
  totalCheckmates: number;
  checkmatesByPiece: {
    pawn?: number;
    knight?: number;
    bishop?: number;
    rook?: number;
    queen?: number;
  };
  fastest: AwardWithGame | null;
  mostCommonPattern: {
    piece: string;
    count: number;
  };
}

// ============================================================================
// GAME PHASES STATISTICS
// ============================================================================

export interface GamePhaseStats {
  averageOpening: number;
  averageMiddlegame: number;
  averageEndgame: number;
  longestWaitTillCapture: AwardWithMoves;
  longestMiddlegame: AwardWithMoves;
  longestEndgame: AwardWithMoves;
}

// ============================================================================
// OPENING STATISTICS
// ============================================================================

export interface OpeningStats {
  totalUnique: number;
  coverage: number;
  mostPopular: Array<{
    eco: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  byColor: {
    white: { count: number; percentage: number };
    black: { count: number; percentage: number };
  };
}

// ============================================================================
// BOARD HEATMAP
// ============================================================================

export interface HeatmapStats {
  mostPopularSquare: {
    square: string;
    visits: number;
    description: string;
  };
  leastPopularSquare: {
    square: string;
    visits: number;
    description: string;
  };
  quietestSquares: Array<any>;
  top5Bloodiest: Array<{
    square: string;
    captures: number;
  }>;
  top5Popular: Array<{
    square: string;
    visits: number;
  }>;
  data: Record<string, number>;
}

// ============================================================================
// AWARDS
// ============================================================================

export interface AwardStats {
  bloodbath: AwardWithCaptures | null;
  pacifist: AwardWithCaptures | null;
  speedDemon: AwardWithGame | null;
  endgameWizard: AwardWithMoves;
  openingSprinter: AwardWithMoves | null;
}

// ============================================================================
// RATING ANALYSIS (FIDE-Specific)
// ============================================================================

export interface RatingAnalysis {
  hasRatingData: boolean;
  totalGames: number;
  gamesWithRatings: number;
  coverage: number;
  averageEloDifference: number;
  upsets: Array<{
    underdog: string;
    underdogRating: number;
    favorite: string;
    favoriteRating: number;
    eloDifference: number;
    result: string;
    white: string;
    black: string;
  }>;
  biggestUpset: {
    underdog: string;
    underdogRating: number;
    favorite: string;
    favoriteRating: number;
    eloDifference: number;
    result: string;
    white: string;
    black: string;
  } | null;
  favoritePerformance: {
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  };
}

// ============================================================================
// FIDE FUN AWARDS (FIDE-Specific)
// ============================================================================

export interface FideFunAwards {
  tiebreakWarrior: {
    player: string;
    tiebreakWins: number;
    deepestTiebreak: string;
  } | null;
  giantSlayer: {
    player: string;
    defeated: string;
    ratingDifference: number;
    result: string;
  } | null;
  rapidFire: {
    white: string;
    black: string;
    moves: number;
    winner: string;
  } | null;
  blitzWizard: {
    player: string;
    blitzWins: number;
  } | null;
  classicalPurist: {
    player: string;
    classicalWins: number;
  } | null;
  marathonMaster: {
    players: string;
    totalGames: number;
    totalMoves: number;
    winner: string;
  } | null;
  fortressBuilder: {
    players: string;
    draws: number;
    totalGames: number;
  } | null;
  upsetArtist: {
    player: string;
    upsets: number;
  } | null;
}

// ============================================================================
// DATA INFO
// ============================================================================

export interface DataInfo {
  totalMatches: number;
  totalGames: number;
  openingCoverage: number;
}

// ============================================================================
// MAIN ROUND STATS TYPE
// ============================================================================

export interface RoundStats {
  roundNumber: number;
  roundName: string;
  generatedAt: string;

  // Match-level statistics (FIDE-specific)
  matchStats: MatchStats;

  // Core game statistics
  overview: OverviewStats;
  results: ResultsStats;
  tactics: TacticsStats;
  pieces: PieceStats;
  checkmates: CheckmateStats;
  heatmap: HeatmapStats;
  gamePhases: GamePhaseStats | null;
  openings: OpeningStats;
  awards: AwardStats;

  // Time control breakdown
  byTimeControl: {
    classical?: Partial<RoundStats>;
    rapidTier1?: Partial<RoundStats>;
    rapidTier2?: Partial<RoundStats>;
    blitzTier1?: Partial<RoundStats>;
    blitzTier2?: Partial<RoundStats>;
  };

  // FIDE-specific statistics
  ratingAnalysis: RatingAnalysis;
  fideFunAwards: FideFunAwards;

  // Metadata
  dataInfo: DataInfo;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type TimeControlType = 'classical' | 'rapidTier1' | 'rapidTier2' | 'blitzTier1' | 'blitzTier2';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
