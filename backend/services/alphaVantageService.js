const axios = require('axios');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

class AlphaVantageService {
  // Get real-time stock quote
  async getQuote(symbol) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: API_KEY
        }
      });

      const quote = response.data['Global Quote'];
      
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('Invalid symbol or no data available');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low'])
      };
    } catch (error) {
      console.error('Alpha Vantage Quote Error:', error.message);
      throw error;
    }
  }

  // Get historical daily data (for charts)
  async getDailyData(symbol, outputSize = 'compact') {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: outputSize, // 'compact' = 100 days, 'full' = 20 years
          apikey: API_KEY
        }
      });

      const timeSeries = response.data['Time Series (Daily)'];
      
      if (!timeSeries) {
        throw new Error('No historical data available');
      }

      // Convert to array format for charting
      const chartData = Object.keys(timeSeries).map(date => ({
        date,
        open: parseFloat(timeSeries[date]['1. open']),
        high: parseFloat(timeSeries[date]['2. high']),
        low: parseFloat(timeSeries[date]['3. low']),
        close: parseFloat(timeSeries[date]['4. close']),
        volume: parseInt(timeSeries[date]['5. volume'])
      })).reverse(); // Reverse to get chronological order

      return chartData;
    } catch (error) {
      console.error('Alpha Vantage Daily Data Error:', error.message);
      throw error;
    }
  }

  // Get RSI (Relative Strength Index)
  async getRSI(symbol, timePeriod = 14) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'RSI',
          symbol: symbol,
          interval: 'daily',
          time_period: timePeriod,
          series_type: 'close',
          apikey: API_KEY
        }
      });

      const rsiData = response.data['Technical Analysis: RSI'];
      
      if (!rsiData) {
        throw new Error('RSI data not available');
      }

      // Get the most recent RSI value
      const dates = Object.keys(rsiData);
      const latestDate = dates[0];
      const rsiValue = parseFloat(rsiData[latestDate]['RSI']);

      return {
        value: rsiValue,
        date: latestDate,
        signal: rsiValue < 30 ? 'Oversold (Buy)' : 
                rsiValue > 70 ? 'Overbought (Sell)' : 'Neutral'
      };
    } catch (error) {
      console.error('Alpha Vantage RSI Error:', error.message);
      throw error;
    }
  }

  // Get MACD (Moving Average Convergence Divergence)
  async getMACD(symbol) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'MACD',
          symbol: symbol,
          interval: 'daily',
          series_type: 'close',
          apikey: API_KEY
        }
      });

      const macdData = response.data['Technical Analysis: MACD'];
      
      if (!macdData) {
        throw new Error('MACD data not available');
      }

      // Get the most recent MACD values
      const dates = Object.keys(macdData);
      const latestDate = dates[0];
      const macd = parseFloat(macdData[latestDate]['MACD']);
      const signal = parseFloat(macdData[latestDate]['MACD_Signal']);
      const histogram = parseFloat(macdData[latestDate]['MACD_Hist']);

      return {
        macd,
        signal,
        histogram,
        date: latestDate,
        crossover: macd > signal ? 'Bullish (Buy)' : 'Bearish (Sell)'
      };
    } catch (error) {
      console.error('Alpha Vantage MACD Error:', error.message);
      throw error;
    }
  }

  // Get SMA (Simple Moving Average)
  async getSMA(symbol, timePeriod = 50) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'SMA',
          symbol: symbol,
          interval: 'daily',
          time_period: timePeriod,
          series_type: 'close',
          apikey: API_KEY
        }
      });

      const smaData = response.data['Technical Analysis: SMA'];
      
      if (!smaData) {
        throw new Error('SMA data not available');
      }

      // Get the most recent SMA value
      const dates = Object.keys(smaData);
      const latestDate = dates[0];
      const smaValue = parseFloat(smaData[latestDate]['SMA']);

      return {
        value: smaValue,
        period: timePeriod,
        date: latestDate
      };
    } catch (error) {
      console.error('Alpha Vantage SMA Error:', error.message);
      throw error;
    }
  }

  // Search for stock symbols
  async searchSymbol(keywords) {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: keywords,
          apikey: API_KEY
        }
      });

      const matches = response.data.bestMatches || [];
      
      return matches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency']
      }));
    } catch (error) {
      console.error('Alpha Vantage Search Error:', error.message);
      throw error;
    }
  }
}

module.exports = new AlphaVantageService();
