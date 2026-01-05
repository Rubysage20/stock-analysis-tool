const alphaVantageService = require('./alphaVantageService');

class RecommendationEngine {
  async analyzeStock(symbol) {
    try {
      // Fetch all indicators in parallel
      const [quote, rsi, macd, sma50, sma200] = await Promise.all([
        alphaVantageService.getQuote(symbol),
        alphaVantageService.getRSI(symbol, 14),
        alphaVantageService.getMACD(symbol),
        alphaVantageService.getSMA(symbol, 50),
        alphaVantageService.getSMA(symbol, 200)
      ]);

      // Analyze each indicator
      const signals = {
        rsi: this.analyzeRSI(rsi.value),
        macd: this.analyzeMACD(macd.macd, macd.signal),
        movingAverages: this.analyzeMovingAverages(quote.price, sma50.value, sma200.value),
        trend: this.analyzeTrend(sma50.value, sma200.value)
      };

      // Calculate overall recommendation
      const recommendation = this.calculateOverallRecommendation(signals);

      return {
        symbol,
        currentPrice: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        indicators: {
          rsi: {
            value: rsi.value,
            signal: rsi.signal,
            interpretation: signals.rsi
          },
          macd: {
            macd: macd.macd,
            signal: macd.signal,
            histogram: macd.histogram,
            interpretation: signals.macd
          },
          movingAverages: {
            sma50: sma50.value,
            sma200: sma200.value,
            price: quote.price,
            interpretation: signals.movingAverages
          },
          trend: signals.trend
        },
        recommendation: recommendation,
        analysis: this.getDetailedAnalysis(signals, recommendation),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Recommendation Engine Error:', error.message);
      throw error;
    }
  }

  analyzeRSI(rsiValue) {
    if (rsiValue < 30) {
      return { score: 2, signal: 'BUY', reason: 'Oversold - potential buy opportunity' };
    } else if (rsiValue > 70) {
      return { score: -2, signal: 'SELL', reason: 'Overbought - consider selling' };
    } else if (rsiValue >= 40 && rsiValue <= 60) {
      return { score: 0, signal: 'NEUTRAL', reason: 'RSI in neutral zone' };
    } else if (rsiValue >= 30 && rsiValue < 40) {
      return { score: 1, signal: 'WEAK BUY', reason: 'Approaching oversold territory' };
    } else {
      return { score: -1, signal: 'WEAK SELL', reason: 'Approaching overbought territory' };
    }
  }

  analyzeMACD(macdValue, signalValue) {
    const diff = macdValue - signalValue;
    
    if (diff > 0 && Math.abs(diff) > 0.5) {
      return { score: 2, signal: 'BUY', reason: 'MACD crossed above signal - bullish' };
    } else if (diff < 0 && Math.abs(diff) > 0.5) {
      return { score: -2, signal: 'SELL', reason: 'MACD crossed below signal - bearish' };
    } else if (diff > 0) {
      return { score: 1, signal: 'WEAK BUY', reason: 'MACD above signal but weakening' };
    } else {
      return { score: -1, signal: 'WEAK SELL', reason: 'MACD below signal but strengthening' };
    }
  }

  analyzeMovingAverages(currentPrice, sma50, sma200) {
    const aboveSMA50 = currentPrice > sma50;
    const aboveSMA200 = currentPrice > sma200;

    if (aboveSMA50 && aboveSMA200) {
      return { score: 2, signal: 'BUY', reason: 'Price above both 50 & 200 MA - strong uptrend' };
    } else if (!aboveSMA50 && !aboveSMA200) {
      return { score: -2, signal: 'SELL', reason: 'Price below both 50 & 200 MA - downtrend' };
    } else if (aboveSMA50 && !aboveSMA200) {
      return { score: 1, signal: 'WEAK BUY', reason: 'Price above 50 MA but below 200 MA' };
    } else {
      return { score: -1, signal: 'WEAK SELL', reason: 'Price below 50 MA but above 200 MA' };
    }
  }

  analyzeTrend(sma50, sma200) {
    if (sma50 > sma200) {
      const gap = ((sma50 - sma200) / sma200) * 100;
      return {
        type: 'BULLISH',
        strength: gap > 5 ? 'STRONG' : 'MODERATE',
        description: 'Golden Cross - 50 MA above 200 MA'
      };
    } else {
      const gap = ((sma200 - sma50) / sma200) * 100;
      return {
        type: 'BEARISH',
        strength: gap > 5 ? 'STRONG' : 'MODERATE',
        description: 'Death Cross - 50 MA below 200 MA'
      };
    }
  }

  calculateOverallRecommendation(signals) {
    // Sum up all scores
    const totalScore = signals.rsi.score + 
                       signals.macd.score + 
                       signals.movingAverages.score;

    // Determine recommendation based on total score
    if (totalScore >= 5) {
      return {
        action: 'STRONG BUY',
        confidence: 'HIGH',
        color: '#22c55e', // green
        description: 'Multiple indicators showing strong buy signals'
      };
    } else if (totalScore >= 3) {
      return {
        action: 'BUY',
        confidence: 'MEDIUM',
        color: '#84cc16', // light green
        description: 'Positive indicators suggest buying opportunity'
      };
    } else if (totalScore >= 1) {
      return {
        action: 'WEAK BUY',
        confidence: 'LOW',
        color: '#eab308', // yellow
        description: 'Some positive signals, proceed with caution'
      };
    } else if (totalScore <= -5) {
      return {
        action: 'STRONG SELL',
        confidence: 'HIGH',
        color: '#ef4444', // red
        description: 'Multiple indicators showing strong sell signals'
      };
    } else if (totalScore <= -3) {
      return {
        action: 'SELL',
        confidence: 'MEDIUM',
        color: '#f97316', // orange
        description: 'Negative indicators suggest selling'
      };
    } else if (totalScore <= -1) {
      return {
        action: 'WEAK SELL',
        confidence: 'LOW',
        color: '#fb923c', // light orange
        description: 'Some negative signals, monitor closely'
      };
    } else {
      return {
        action: 'HOLD',
        confidence: 'NEUTRAL',
        color: '#6b7280', // gray
        description: 'Mixed signals, hold current position'
      };
    }
  }

  getDetailedAnalysis(signals, recommendation) {
    const bullishSignals = [];
    const bearishSignals = [];

    // Collect bullish signals
    if (signals.rsi.score > 0) bullishSignals.push(signals.rsi.reason);
    if (signals.macd.score > 0) bullishSignals.push(signals.macd.reason);
    if (signals.movingAverages.score > 0) bullishSignals.push(signals.movingAverages.reason);
    if (signals.trend.type === 'BULLISH') bullishSignals.push(signals.trend.description);

    // Collect bearish signals
    if (signals.rsi.score < 0) bearishSignals.push(signals.rsi.reason);
    if (signals.macd.score < 0) bearishSignals.push(signals.macd.reason);
    if (signals.movingAverages.score < 0) bearishSignals.push(signals.movingAverages.reason);
    if (signals.trend.type === 'BEARISH') bearishSignals.push(signals.trend.description);

    return {
      summary: recommendation.description,
      bullishSignals,
      bearishSignals,
      signalStrength: {
        bullish: bullishSignals.length,
        bearish: bearishSignals.length
      }
    };
  }
}

module.exports = new RecommendationEngine();
