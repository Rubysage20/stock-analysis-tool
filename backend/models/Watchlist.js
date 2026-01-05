const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  currentPrice: {
    type: Number
  },
  targetPrice: {
    type: Number
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
