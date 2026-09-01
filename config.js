/**
 * Configuration for FisherBot
 */

module.exports = {
  // Socket.io server connection
  SERVER_URL: process.env.SERVER_URL || 'http://windows93.net',
  SOCKET_CONFIG: {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  },

  // Game mechanics
  BAIT_PRICE: 150,
  INITIAL_CASH: 50,
  COOLDOWN_MS: 5000,
  COOLDOWN_CLEANUP_INTERVAL: 60000, // Clean old cooldowns every 1 minute
  SAVE_INTERVAL_MS: 5000, // Auto-save every 5 seconds

  // Steal mechanics
  STEAL_SUCCESS_RATE: 0.40, // 40% success rate (inverted from > 0.60)
  STEAL_MIN_TARGET_CASH: 20,
  STEAL_PENALTY: 30,
  STEAL_MAX_PERCENTAGE: 0.30, // Steal up to 30% of target's cash

  // Fishing odds
  FISHING_ODDS: {
    withoutBait: {
      junk: 0.40,
      fish: 0.45, // (0.85 - 0.40)
      rare: 0.15, // (1.0 - 0.85)
    },
    withBait: {
      junk: 0.20,
      fish: 0.45, // (0.65 - 0.20)
      rare: 0.35, // (1.0 - 0.65)
    },
  },

  // File paths
  SCORE_FILE: './scores.json',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
};
