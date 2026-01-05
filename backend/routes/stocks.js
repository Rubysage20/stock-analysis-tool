const express = require('express');
const router = express.Router();
const alphaVantageService = require('../services/alphaVantageService');
const recommendationEngine = require('../services/recommendationEngine');

// @route   GET /api/stocks/search/:keywords
// @desc    Search for stock symbols
// @access  Public
router.get('/search/:keywords', async (req, res) => {
  try {
    const results = await alphaVantageService.searchSymbol(req.params.keywords);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stocks/quote/:symbol
// @desc    Get real-time stock quote
// @access  Public
router.get('/quote/:symbol', async (req, res) => {
  try {
    const quote = await alphaVantageService.getQuote(req.params.symbol);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stocks/chart/:symbol
// @desc    Get historical chart data
// @access  Public
router.get('/chart/:symbol', async (req, res) => {
  try {
    const outputSize = req.query.range || 'compact'; // compact or full
    const chartData = await alphaVantageService.getDailyData(
      req.params.symbol,
      outputSize
    );
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stocks/indicators/:symbol
// @desc    Get technical indicators (RSI, MACD, SMA)
// @access  Public
router.get('/indicators/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    
    const [rsi, macd, sma50, sma200] = await Promise.all([
      alphaVantageService.getRSI(symbol),
      alphaVantageService.getMACD(symbol),
      alphaVantageService.getSMA(symbol, 50),
      alphaVantageService.getSMA(symbol, 200)
    ]);

    res.json({
      symbol,
      rsi,
      macd,
      sma: {
        sma50,
        sma200
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/stocks/recommendation/:symbol
// @desc    Get buy/sell recommendation based on technical analysis
// @access  Public
router.get('/recommendation/:symbol', async (req, res) => {
  try {
    const analysis = await recommendationEngine.analyzeStock(req.params.symbol);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
