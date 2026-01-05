# Stock Analysis Tool

AI-Powered Investment Assistant providing real-time stock analysis, buy/sell recommendations, and portfolio tracking.

## Features

✅ **Real-time Stock Data** - Live prices, volume, and charts
✅ **Technical Indicators** - RSI, MACD, Moving Averages
✅ **Smart Recommendations** - AI-powered buy/sell/hold signals
✅ **Watchlist** - Track your favorite stocks
✅ **Portfolio Tracker** - Monitor your investments
✅ **News Sentiment** - Analyze market sentiment from news
✅ **Price Alerts** - Get notified when stocks hit target prices

## Tech Stack

**Frontend:**
- React 18
- Recharts (data visualization)
- Axios (API calls)
- Tailwind CSS (styling)

**Backend:**
- Node.js + Express
- MongoDB (data storage)
- Alpha Vantage API (stock data)
- Finnhub API (news & sentiment)

## Project Structure

```
stock-analysis-tool/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Watchlist.js
│   │   └── Portfolio.js
│   ├── routes/
│   │   ├── stocks.js
│   │   ├── watchlist.js
│   │   └── portfolio.js
│   ├── controllers/
│   │   ├── stockController.js
│   │   ├── analysisController.js
│   │   └── portfolioController.js
│   ├── services/
│   │   ├── alphaVantageService.js
│   │   ├── finnhubService.js
│   │   └── recommendationEngine.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StockSearch.jsx
│   │   │   ├── StockChart.jsx
│   │   │   ├── TechnicalIndicators.jsx
│   │   │   ├── Recommendation.jsx
│   │   │   ├── Watchlist.jsx
│   │   │   └── Portfolio.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── calculations.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- API Keys:
  - Alpha Vantage: https://www.alphavantage.co/support/#api-key
  - Finnhub: https://finnhub.io/register

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock-analysis
ALPHA_VANTAGE_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
JWT_SECRET=your_secret_key
```

Start backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000
Backend runs on: http://localhost:5000

## API Endpoints

### Stock Data
- `GET /api/stocks/search/:symbol` - Get stock quote
- `GET /api/stocks/chart/:symbol` - Get historical data
- `GET /api/stocks/indicators/:symbol` - Get technical indicators
- `GET /api/stocks/recommendation/:symbol` - Get buy/sell recommendation

### Watchlist
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist/:symbol` - Remove from watchlist

### Portfolio
- `GET /api/portfolio` - Get user's portfolio
- `POST /api/portfolio` - Add stock to portfolio
- `PUT /api/portfolio/:id` - Update position
- `DELETE /api/portfolio/:id` - Remove position

## Recommendation Algorithm

The tool uses multiple technical indicators to generate recommendations:

1. **RSI (Relative Strength Index)**
   - RSI < 30 = Oversold (Buy signal)
   - RSI > 70 = Overbought (Sell signal)

2. **MACD (Moving Average Convergence Divergence)**
   - MACD crosses above signal = Buy
   - MACD crosses below signal = Sell

3. **Moving Averages**
   - Price > MA50 & MA200 = Bullish (Buy)
   - Price < MA50 & MA200 = Bearish (Sell)

4. **Overall Recommendation**
   - Strong Buy: 3/3 indicators bullish
   - Buy: 2/3 indicators bullish
   - Hold: Mixed signals
   - Sell: 2/3 indicators bearish
   - Strong Sell: 3/3 indicators bearish

## Deployment

**Frontend:** Vercel
```bash
vercel --prod
```

**Backend:** Railway or Render
```bash
# Connect GitHub repo and deploy
```

## Future Enhancements

- [ ] News sentiment analysis with NLP
- [ ] Price alerts (email/SMS)
- [ ] Multi-stock comparison
- [ ] Backtesting strategies
- [ ] Mobile app version
- [ ] Social features (share watchlists)

## License

MIT

## Author

Valerie Dawson
- GitHub: https://github.com/Rubysage20
- Email: Valerienailedit@gmail.com
