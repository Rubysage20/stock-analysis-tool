const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  companyName: {
    type: String,
    required: true
  },
  shares: {
    type: Number,
    required: true,
    min: 0
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  currentPrice: {
    type: Number
  },
  profitLoss: {
    type: Number
  },
  profitLossPercent: {
    type: Number
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate profit/loss before saving
PortfolioSchema.pre('save', function(next) {
  if (this.currentPrice) {
    const totalCost = this.shares * this.purchasePrice;
    const currentValue = this.shares * this.currentPrice;
    this.profitLoss = currentValue - totalCost;
    this.profitLossPercent = ((currentValue - totalCost) / totalCost) * 100;
  }
  next();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
