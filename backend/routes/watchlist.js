const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const alphaVantageService = require('../services/alphaVantageService');

// @route   GET /api/watchlist
// @desc    Get all watchlist items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const watchlist = await Watchlist.find().sort({ addedAt: -1 });
    
    // Update current prices for each stock
    const updatedWatchlist = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const quote = await alphaVantageService.getQuote(item.symbol);
          item.currentPrice = quote.price;
          await item.save();
          return item;
        } catch (error) {
          console.error(`Error updating ${item.symbol}:`, error.message);
          return item;
        }
      })
    );

    res.json(updatedWatchlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/watchlist
// @desc    Add stock to watchlist
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { symbol, companyName, targetPrice, notes } = req.body;

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    // Get current price
    const quote = await alphaVantageService.getQuote(symbol);

    const watchlistItem = new Watchlist({
      symbol: symbol.toUpperCase(),
      companyName: companyName || quote.symbol,
      currentPrice: quote.price,
      targetPrice,
      notes
    });

    await watchlistItem.save();
    res.status(201).json(watchlistItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/watchlist/:id
// @desc    Update watchlist item
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { targetPrice, notes } = req.body;
    
    const item = await Watchlist.findByIdAndUpdate(
      req.params.id,
      { targetPrice, notes },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/watchlist/:symbol
// @desc    Remove stock from watchlist
// @access  Public
router.delete('/:symbol', async (req, res) => {
  try {
    const item = await Watchlist.findOneAndDelete({ 
      symbol: req.params.symbol.toUpperCase() 
    });

    if (!item) {
      return res.status(404).json({ error: 'Stock not in watchlist' });
    }

    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
