const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const alphaVantageService = require('../services/alphaVantageService');

// @route   GET /api/portfolio
// @desc    Get entire portfolio with current values
// @access  Public
router.get('/', async (req, res) => {
  try {
    const portfolio = await Portfolio.find().sort({ purchaseDate: -1 });
    
    // Update current prices and profit/loss
    const updatedPortfolio = await Promise.all(
      portfolio.map(async (position) => {
        try {
          const quote = await alphaVantageService.getQuote(position.symbol);
          position.currentPrice = quote.price;
          await position.save(); // This triggers the pre-save hook to calculate P/L
          return position;
        } catch (error) {
          console.error(`Error updating ${position.symbol}:`, error.message);
          return position;
        }
      })
    );

    // Calculate total portfolio value and P/L
    const totalValue = updatedPortfolio.reduce((sum, pos) => {
      return sum + (pos.shares * pos.currentPrice);
    }, 0);

    const totalCost = updatedPortfolio.reduce((sum, pos) => {
      return sum + (pos.shares * pos.purchasePrice);
    }, 0);

    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = ((totalValue - totalCost) / totalCost) * 100;

    res.json({
      positions: updatedPortfolio,
      summary: {
        totalValue: totalValue.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalProfitLoss: totalProfitLoss.toFixed(2),
        totalProfitLossPercent: totalProfitLossPercent.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/portfolio
// @desc    Add stock position to portfolio
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { symbol, companyName, shares, purchasePrice, purchaseDate } = req.body;

    // Validate input
    if (!symbol || !shares || !purchasePrice || !purchaseDate) {
      return res.status(400).json({ 
        error: 'Symbol, shares, purchase price, and purchase date are required' 
      });
    }

    // Get current price
    const quote = await alphaVantageService.getQuote(symbol);

    const position = new Portfolio({
      symbol: symbol.toUpperCase(),
      companyName: companyName || quote.symbol,
      shares: parseFloat(shares),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate: new Date(purchaseDate),
      currentPrice: quote.price
    });

    await position.save();
    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio position (add/remove shares)
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { shares, purchasePrice } = req.body;
    
    const updates = {};
    if (shares !== undefined) updates.shares = parseFloat(shares);
    if (purchasePrice !== undefined) updates.purchasePrice = parseFloat(purchasePrice);
    
    const position = await Portfolio.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    // Update current price
    const quote = await alphaVantageService.getQuote(position.symbol);
    position.currentPrice = quote.price;
    await position.save();

    res.json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/portfolio/:id
// @desc    Remove position from portfolio
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const position = await Portfolio.findByIdAndDelete(req.params.id);

    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }

    res.json({ message: 'Position removed from portfolio' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/portfolio/stats
// @desc    Get portfolio performance statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const portfolio = await Portfolio.find();
    
    if (portfolio.length === 0) {
      return res.json({ message: 'Portfolio is empty' });
    }

    // Calculate various statistics
    const stats = {
      totalPositions: portfolio.length,
      bestPerformer: portfolio.reduce((max, pos) => 
        pos.profitLossPercent > max.profitLossPercent ? pos : max
      ),
      worstPerformer: portfolio.reduce((min, pos) => 
        pos.profitLossPercent < min.profitLossPercent ? pos : min
      ),
      winningPositions: portfolio.filter(pos => pos.profitLoss > 0).length,
      losingPositions: portfolio.filter(pos => pos.profitLoss < 0).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
