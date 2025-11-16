/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Fun Stats Orchestrator
 *
 * Coordinates all fun stat calculators and returns combined results.
 */

const { calculateQueenTrades } = require('./queen-trades');
const { calculateCaptureSequence } = require('./capture-sequence');
const { calculateCheckSequence } = require('./check-sequence');
const { calculatePawnStorm } = require('./pawn-storm');
const { calculatePieceLoyalty } = require('./piece-loyalty');
const { calculateSquareTourist } = require('./square-tourist');
const { calculateCastlingRace } = require('./castling-race');
const { calculateOpeningHipster } = require('./opening-hipster');
const { calculateDadbodShuffler } = require('./dadbod-shuffler');
const { calculateSportyQueen } = require('./sporty-queen');
const { calculateEdgeLord } = require('./edge-lord');
const { calculateRookLift } = require('./rook-lift');
const { calculateCenterStage } = require('./center-stage');
const { calculateDarkLord } = require('./dark-lord');
const { calculateChickenAward } = require('./chicken-award');
const { calculateSlowestCastling } = require('./slowest-castling');
const { calculatePawnCaptures } = require('./pawn-captures');
const { calculateAntiOrthogonal } = require('./anti-orthogonal');
const { calculateComfortZone } = require('./comfort-zone');
const { filterGamesWithMoves } = require('../helpers/game-helpers');

/**
 * Calculate all fun statistics
 * @param {Array} games - Array of game objects
 * @returns {Object} All fun statistics
 *
 * Note: Time-based awards and tactical pattern awards are not included
 * as FIDE PGNs don't contain clock data and we don't have external analysis
 */
function calculateFunStats(games) {
  const gamesWithMoves = filterGamesWithMoves(games);

  const queenTrades = calculateQueenTrades(gamesWithMoves);
  const pieceLoyalty = calculatePieceLoyalty(gamesWithMoves);

  const funStats = {
    fastestQueenTrade: queenTrades?.fastest || null,
    slowestQueenTrade: queenTrades?.slowest || null,
    longestCaptureSequence: calculateCaptureSequence(gamesWithMoves),
    longestCheckSequence: calculateCheckSequence(gamesWithMoves),
    pawnStorm: calculatePawnStorm(gamesWithMoves),
    pieceLoyalty: pieceLoyalty?.moves >= 30 ? pieceLoyalty : null, // Only show if 30+ moves (15 full moves)
    squareTourist: calculateSquareTourist(gamesWithMoves),
    castlingRace: calculateCastlingRace(gamesWithMoves),
    openingHipster: calculateOpeningHipster(gamesWithMoves),
    dadbodShuffler: calculateDadbodShuffler(gamesWithMoves),
    sportyQueen: calculateSportyQueen(gamesWithMoves),
    edgeLord: calculateEdgeLord(gamesWithMoves),
    rookLift: calculateRookLift(gamesWithMoves),
    centerStage: calculateCenterStage(gamesWithMoves),
    darkLord: calculateDarkLord(gamesWithMoves),
    chickenAward: calculateChickenAward(gamesWithMoves),
    slowestCastling: calculateSlowestCastling(gamesWithMoves),
    pawnCaptures: calculatePawnCaptures(gamesWithMoves),
    antiOrthogonal: calculateAntiOrthogonal(gamesWithMoves),
    comfortZone: calculateComfortZone(gamesWithMoves),
  };

  return funStats;
}

module.exports = { calculateFunStats };
