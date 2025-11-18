// TypeScript type definitions for FIDE World Cup statistics
// Generated from public/stats/round-N-stats.json structure

// ============================================================================
// CORE STATISTICS TYPES
// ============================================================================

export interface GameReference {
  white: string;
  black: string;
  result?: string;
  gameId: string;
  whiteElo?: number | null;
  blackElo?: number | null;
}

export interface AwardWithGame extends GameReference {
  moves: number;
  winner?: string;
}

export interface AwardWithCaptures extends GameReference {
  captures: number;
}

export interface AwardWithMoves extends GameReference {
  moves?: number;
  endgameMoves?: number;
  openingMoves?: number;
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
  quietestSquares: Array<{
    square: string;
    visits: number;
  }>;
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
// FUN STATS (CHESS-BASED AWARDS)
// ============================================================================

export interface FunStats {
  fastestQueenTrade: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    white: string;
    black: string;
  } | null;
  slowestQueenTrade: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    white: string;
    black: string;
  } | null;
  longestCaptureSequence: {
    length: number;
    gameIndex: number;
    gameId: string | null;
    startMove: number;
    white: string;
    black: string;
  } | null;
  longestCheckSequence: {
    length: number;
    gameIndex: number;
    gameId: string | null;
    startMove: number;
    white: string;
    black: string;
  } | null;
  pawnStorm: {
    count: number;
    gameIndex: number;
    gameId: string | null;
    white: string;
    black: string;
  } | null;
  pieceLoyalty: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    piece: string;
    square: string;
    white: string;
    black: string;
  } | null;
  squareTourist: {
    squares: number;
    gameIndex: number;
    gameId: string | null;
    piece: string;
    color: string;
    startSquare: string;
    white: string;
    black: string;
  } | null;
  castlingRace: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    winner: string;
    white: string;
    black: string;
  } | null;
  openingHipster: {
    gameIndex: number;
    gameId: string | null;
    eco: string;
    name: string;
    moves: string;
    white: string;
    black: string;
  } | null;
  dadbodShuffler: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  sportyQueen: {
    distance: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  edgeLord: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  rookLift: {
    moveNumber: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    rook: string;
    square: string;
    white: string;
    black: string;
  } | null;
  centerStage: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    piece: string;
    startSquare: string;
    color: string;
    white: string;
    black: string;
  } | null;
  darkLord: {
    captures: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  lightLord: {
    captures: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  chickenAward: {
    retreats: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  slowestCastling: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  pawnCaptures: {
    captures: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  antiOrthogonal: {
    moves: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  comfortZone: {
    percentage: number;
    pieceType: string;
    moves: number;
    totalNonPawnMoves: number;
    gameIndex: number;
    gameId: string | null;
    color: string;
    white: string;
    black: string;
  } | null;
  lateBloomer: {
    moveNumber: number;
    gameIndex: number;
    gameId: string | null;
    player: string;
    color: string;
    white: string;
    black: string;
    whiteRating?: number | null;
    blackRating?: number | null;
  } | null;
  quickDraw: {
    moveNumber: number;
    gameIndex: number;
    gameId: string | null;
    player: string;
    color: string;
    white: string;
    black: string;
    whiteRating?: number | null;
    blackRating?: number | null;
  } | null;
  homebody: {
    count: number;
    gameIndex: number;
    gameId: string | null;
    player: string;
    color: string;
    white: string;
    black: string;
    whiteRating?: number | null;
    blackRating?: number | null;
  } | null;
  deepStrike: {
    count: number;
    gameIndex: number;
    gameId: string | null;
    player: string;
    color: string;
    white: string;
    black: string;
    whiteRating?: number | null;
    blackRating?: number | null;
  } | null;
  crosshairs: {
    square: string;
    attackers: number;
    whiteAttackers: number;
    blackAttackers: number;
    moveNumber: number;
    move: string;
    gameIndex: number;
    gameId: string | null;
    white: string;
    black: string;
    whiteRating?: number | null;
    blackRating?: number | null;
  } | null;
  longestTension: {
    moves: number;
    squares: string;
    piece1: string;
    piece2: string;
    startMove: number;
    endMove: number;
    gameIndex: number;
    gameId: string | null;
    white: string;
    black: string;
    whiteRating?: number | null;
    blackRating?: number | null;
  } | null;
}

// ============================================================================
// TIME AWARDS (TIME-BASED AWARDS)
// ============================================================================

export interface TimeAwards {
  longestThink: {
    white: string;
    black: string;
    whiteRating: number | null;
    blackRating: number | null;
    player: string;
    color: 'white' | 'black';
    timeSpent: number;
    moveNumber: number;
    move: string;
    timeControl: string;
    gameIndex?: number;
  } | null;

  zeitnotAddict: {
    white: string;
    black: string;
    whiteRating: number | null;
    blackRating: number | null;
    player: string;
    color: 'white' | 'black';
    count: number;
    minClock: number;
    timeControl: string;
    gameIndex?: number;
  } | null;

  timeScrambleSurvivor: {
    white: string;
    black: string;
    whiteRating: number | null;
    blackRating: number | null;
    winner: string;
    color: 'white' | 'black';
    minClock: number;
    criticalMoves: number;
    timeControl: string;
    gameIndex?: number;
    result: string;
  } | null;

  bulletSpeed: {
    white: string;
    black: string;
    whiteRating: number | null;
    blackRating: number | null;
    player: string;
    color: 'white' | 'black';
    avgTime: number;
    moveCount: number;
    timeControl: string;
    gameIndex?: number;
  } | null;

  openingBlitzer: {
    white: string;
    black: string;
    whiteRating: number | null;
    blackRating: number | null;
    player: string;
    color: 'white' | 'black';
    avgTime: number;
    moveCount: number;
    timeControl: string;
    gameIndex?: number;
  } | null;

  premoveMaster: {
    white: string;
    black: string;
    whiteRating: number | null;
    blackRating: number | null;
    player: string;
    color: 'white' | 'black';
    count: number;
    timeControl: string;
    gameIndex?: number;
  } | null;

  tiebreakPressureKing: {
    player: string;
    tiebreakWins: number;
    criticalWins: number;
    minClock: number;
    games: Array<{
      white: string;
      black: string;
      timeControl: string;
      minClock: number;
    }>;
  } | null;

  classicalTimeBurner: {
    white: string;
    black: string;
    whiteRating: number | null;
    blackRating: number | null;
    player: string;
    color: 'white' | 'black';
    finalClock: number;
    totalMoves: number;
    result: string;
    gameIndex?: number;
  } | null;

  timeControlSpecialist: {
    player: string;
    specialist: 'classical' | 'rapid' | 'blitz';
    stats: {
      classical: {
        games: number;
        avgFinalClock: number;
        avgMoves: number;
        ratio: number;
      };
      rapid: {
        games: number;
        avgFinalClock: number;
        avgMoves: number;
        ratio: number;
      };
      blitz: {
        games: number;
        avgFinalClock: number;
        avgMoves: number;
        ratio: number;
      };
    };
    variance: number;
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

  // Fun Stats (chess-based awards)
  funStats: FunStats;

  // Time Awards (time-based awards)
  timeAwards: TimeAwards;

  // Stockfish Analysis (optional - only if --analyze flag was used)
  analysis: Analysis | null;

  // Metadata
  dataInfo: DataInfo;
}

// ============================================================================
// STOCKFISH ANALYSIS (ACCURACY & BLUNDERS)
// ============================================================================

export interface Analysis {
  games: Array<{
    gameIndex: number;
    gameId: string | null;
    white: string;
    black: string;
    whiteACPL: number;
    blackACPL: number;
    whiteAccuracy: number;
    blackAccuracy: number;
    whiteMoveQuality: {
      blunders: number;
      mistakes: number;
      inaccuracies: number;
      good: number;
      excellent: number;
    };
    blackMoveQuality: {
      blunders: number;
      mistakes: number;
      inaccuracies: number;
      good: number;
      excellent: number;
    };
    whiteEngineMoves: number;
    blackEngineMoves: number;
    biggestBlunder: {
      moveNumber: number;
      player: string;
      cpLoss: number;
      winLoss: number;
      severity: number;
      move: string;
      evalBefore: number;
      evalAfter: number;
    } | null;
    biggestComeback: {
      player: string;
      swing: number;
      evalFrom: number;
      evalTo: number;
      moveNumber: number;
    } | null;
    luckyEscape: {
      player: string;
      escapeAmount: number;
      evalBefore: number;
      evalAfter: number;
      moveNumber: number;
    } | null;
  }>;
  summary: {
    accuracyKing: {
      player: string;
      accuracy: number;
      acpl: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    biggestBlunder: {
      moveNumber: number;
      player: string;
      cpLoss: number;
      winLoss: number;
      severity: number;
      move: string;
      evalBefore: number;
      evalAfter: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    lowestACPL: {
      player: string;
      acpl: number;
      accuracy: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    highestACPL: {
      player: string;
      acpl: number;
      accuracy: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    lowestCombinedACPL: {
      combinedACPL: number;
      whiteACPL: number;
      blackACPL: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    highestCombinedACPL: {
      combinedACPL: number;
      whiteACPL: number;
      blackACPL: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    comebackKing: {
      player: string;
      swing: number;
      evalFrom: number;
      evalTo: number;
      moveNumber: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    luckyEscape: {
      player: string;
      escapeAmount: number;
      evalBefore: number;
      evalAfter: number;
      moveNumber: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    stockfishBuddy: {
      player: string;
      engineMoves: number;
      totalMoves: number;
      percentage: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    inaccuracyKing: {
      player: string;
      inaccuracies: number;
      white: string;
      black: string;
      gameIndex: number;
      gameId: string | null;
    } | null;
    notSoSuperGM: {
      player: string;
      playerName: string;
      rating: number;
      moveNumber: number;
      cpLoss: number;
      winLoss: number;
      severity: number;
      move: string;
      evalBefore: number;
      evalAfter: number;
      white: string;
      black: string;
      whiteRating: number | null;
      blackRating: number | null;
      gameIndex: number;
      gameId: string | null;
    } | null;
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type TimeControlType = 'classical' | 'rapidTier1' | 'rapidTier2' | 'blitzTier1' | 'blitzTier2';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// TOURNAMENT OVERVIEW TYPES
// ============================================================================

export interface TournamentOverview {
  tournamentName: string;
  location: string;
  totalRounds: number;
  roundsCompleted: number;
  generatedAt: string;
  overall: {
    totalGames: number;
    totalMatches: number;
    totalMoves: number;
    averageGameLength: number;
    longestGame: GameReference & { moves: number; roundNumber: number } | null;
    shortestGame: GameReference & { moves: number; roundNumber: number } | null;
    piecesCaptured: {
      pawns: number;
      knights: number;
      bishops: number;
      rooks: number;
      queens: number;
      total: number;
    };
  };
  byRound: Array<{
    roundNumber: number;
    roundName: string;
    matches: number;
    games: number;
    avgGameLength: number;
    tiebreakRate: number;
    upsetRate: number;
    classicalGames: number;
    rapidGames: number;
    blitzGames: number;
  }>;
  hallOfFame: {
    biggestUpset?: {
      winner: string;
      loser: string;
      ratingDiff: number;
      winnerRating: number;
      loserRating: number;
      roundNumber: number;
    } | null;
  };
  awardFrequency: Record<string, number>;
  playerLeaderboard: Array<{
    name: string;
    totalAwards: number;
    byCategory: Record<string, number>;
    awards: Array<{
      category: string;
      awardKey: string;
      roundNumber: number;
      roundName: string;
    }>;
  }>;
  topAwards: {
    awards: Record<string, Record<string, unknown> & { roundNumber: number; roundName: string }>;
    fideFunAwards: Record<string, Record<string, unknown> & { roundNumber: number; roundName: string }>;
    funStats: Record<string, Record<string, unknown> & { roundNumber: number; roundName: string }>;
    timeAwards: Record<string, Record<string, unknown> & { roundNumber: number; roundName: string }>;
    analysis: Record<string, Record<string, unknown> & { roundNumber: number; roundName: string }>;
  };
  trends: {
    avgGameLengthByRound: number[];
    whiteWinRateByRound: number[];
    drawRateByRound: number[];
    tiebreakRateByRound: number[];
    upsetRateByRound: number[];
    totalGamesByRound: number[];
  };
  openings: {
    mostPopular: Array<{
      name: string;
      count: number;
      wins: number;
      draws: number;
      losses: number;
    }>;
    generalOpenings?: Array<{
      name: string;
      count: number;
    }>;
    firstMoveStats?: Array<{
      move: string;
      count: number;
      wins: number;
      draws: number;
      losses: number;
      whiteWinRate: number;
      popularity: number;
    }>;
  };
  tactics?: {
    totalCaptures: number;
    totalPromotions: number;
    castling: {
      kingside: number;
      queenside: number;
    };
    enPassantGames: Array<{
      white: string;
      black: string;
      count: number;
    }>;
  };
  pieces?: {
    activity: {
      pawns: number;
      knights: number;
      bishops: number;
      rooks: number;
      queens: number;
      kings: number;
    };
    captured: {
      pawns: number;
      knights: number;
      bishops: number;
      rooks: number;
      queens: number;
    };
  };
  checkmates?: {
    byPiece: {
      queen: number;
      rook: number;
      bishop: number;
      knight: number;
      pawn: number;
    };
    fastest: (GameReference & {
      moves: number;
      roundNumber: number;
      winner: string;
    }) | null;
  };
  timeControlComparison?: {
    classical: {
      games: number;
      avgLength: number;
      whiteWins: number;
      draws: number;
      blackWins: number;
      whiteWinRate: number;
      drawRate: number;
      blackWinRate: number;
    };
    rapid: {
      games: number;
      avgLength: number;
      whiteWins: number;
      draws: number;
      blackWins: number;
      whiteWinRate: number;
      drawRate: number;
      blackWinRate: number;
    };
    blitz: {
      games: number;
      avgLength: number;
      whiteWins: number;
      draws: number;
      blackWins: number;
      whiteWinRate: number;
      drawRate: number;
      blackWinRate: number;
    };
  };
  players: {
    startingPlayers: number;
    remainingPlayers: number;
    eliminatedPlayers: number;
  };
}
