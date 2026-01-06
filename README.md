# Nexus Trading Platform
AI-powered stock analysis platform featuring real-time market data, technical indicators, and intelligent buy/sell recommendations with a premium dark luxury UI.
# Live Demo
Portfolio Showcase: https://nexustrading.vercel.app
GitHub Repository: https://github.com/Rubysage20/stock-analysis-tool
Backend API: https://stockanalysistool-production.up.railway.app

# Features
 Premium UI/UX

Custom Crosshair Cursor - Precision targeting mode for data analysis
3D Tilt Cards - Interactive cards with holographic shimmer effects
Particle Background - Animated floating particles creating depth
Dark Luxury Theme - Unique Black/Gold/Emerald palette (not typical blue)
Smooth Animations - Confetti celebrations, toast notifications, progressive loading

# Market Analysis

Live Ticker - Bloomberg-style scrolling ticker with sparklines
Heat Map Visualization - Color-coded market overview showing performance at a glance
Split-Screen Comparison - Compare two stocks side-by-side with different gradient charts
Real-Time Quotes - Current prices, volume, daily changes
30-Day Charts - Interactive area charts with gradient fills

# AI-Powered Insights

Smart Recommendations - BUY/SELL/HOLD signals based on multiple indicators
Technical Analysis - RSI, MACD, Moving Averages (SMA 50/200)
Bullish/Bearish Signals - Detailed breakdown of market indicators
Confidence Scoring - AI analyzes 3+ indicators for recommendation strength

# Portfolio Features

Watchlist Management - Track favorite stocks with target prices
Portfolio Tracking - Monitor investments with real-time P&L calculations
Quick Access - One-click analysis from heat map or ticker


## Tech Stack
Frontend

React 18.0 - Modern component-based UI
Recharts - Data visualization for charts
Lucide React - Icon library
Custom CSS - 800+ lines of advanced styling (3D transforms, animations, particles)
Axios - HTTP client for API calls

Backend

Node.js + Express - RESTful API server
MongoDB Atlas - Cloud database for watchlist and portfolio
Mongoose - MongoDB object modeling
Alpha Vantage API - Real-time stock market data

Deployment

Frontend: Vercel (automatic deployments from GitHub)
Backend: Railway (containerized Node.js deployment)
Database: MongoDB Atlas (cloud cluster)


## Project Structure
stock-analysis-tool/
  backend/
    routes/
      stocks.js - Stock quote, chart, indicators endpoints
      watchlist.js - Watchlist CRUD operations
      portfolio.js - Portfolio tracking
    services/
      alphaVantageService.js - Alpha Vantage API integration
      recommendationEngine.js - AI recommendation logic (RSI, MACD, SMA)
    config/
      db.js - MongoDB connection
    models/
      Watchlist.js - Watchlist schema
      Portfolio.js - Portfolio schema
    server.js - Express server
    package.json
  
  frontend/
    src/
      App.js - Demo version (deployed)
      App-LIVE.js - Live API version
      App.css - Premium dark theme (800+ lines)
      index.js - React entry point
    public/
      index.html
    package.json
  
  README.md
  .gitignore

## Demo vs Live Versions
This project includes two versions to balance portfolio showcase reliability with demonstrating real API integration:
Demo Version (Deployed to Vercel)

File: frontend/src/App.js
Live at: https://nexustrading.vercel.app
Uses realistic test data to avoid API rate limits
Perfect for portfolio showcase - works instantly, always available
All features functional with zero delays
Generates realistic technical indicators and recommendations

Live Version (Full Integration)

File: frontend/src/App-LIVE.js
Connects to Railway backend: https://stockanalysistool-production.up.railway.app
Real Alpha Vantage API integration for live market data
Demonstrates full-stack deployment with external API
Subject to API rate limits (5 calls/min, 500 calls/day)
Progressive loading with 13-second delays to manage rate limits

Why Both? The demo version ensures recruiters can explore all features without hitting rate limits, while the live integration code on GitHub proves production-ready API handling, error management, and deployment skills.

## Quick Start
Prerequisites

Node.js (v14+)
MongoDB Atlas account (free tier works)
Alpha Vantage API key: https://www.alphavantage.co/support/#api-key

Backend Setup
bashcd backend
npm install
Create .env file in backend/ folder:
envPORT=5000
MONGODB_URI=your_mongodb_connection_string
ALPHA_VANTAGE_API_KEY=your_api_key
Start backend server:
bashnpm run dev
Backend runs on: http://localhost:5000
Frontend Setup
bashcd frontend
npm install
npm start
Frontend runs on: http://localhost:3000

## API Endpoints
Stock Data

GET /api/stocks/quote/:symbol - Get real-time stock quote
GET /api/stocks/chart/:symbol - Get 30-day historical data
GET /api/stocks/indicators/:symbol - Get RSI, MACD, SMA indicators
GET /api/stocks/recommendation/:symbol - Get AI buy/sell recommendation

Watchlist

GET /api/watchlist - Get user's watchlist
POST /api/watchlist - Add stock to watchlist
PUT /api/watchlist/:id - Update watchlist item
DELETE /api/watchlist/:symbol - Remove from watchlist

Portfolio

GET /api/portfolio - Get portfolio with real-time P&L
POST /api/portfolio - Add stock position
PUT /api/portfolio/:id - Update position
DELETE /api/portfolio/:id - Remove position
GET /api/portfolio/stats - Get performance statistics


## AI Recommendation Algorithm
The platform analyzes multiple technical indicators to generate intelligent trading recommendations:
1. RSI (Relative Strength Index)

RSI < 30 → Oversold condition = +2 points (Strong Buy signal)
RSI > 70 → Overbought condition = -2 points (Sell signal)
30-70 → Neutral = 0 points

2. MACD (Moving Average Convergence Divergence)

MACD > Signal Line → Bullish momentum = +2 points
MACD < Signal Line → Bearish momentum = -2 points

3. Moving Averages (SMA 50 & SMA 200)

Price > SMA50 & SMA200 → Strong uptrend = +2 points
Price < SMA50 & SMA200 → Downtrend = -2 points

4. Overall Recommendation Logic
javascriptScore >= 4:  STRONG BUY (Multiple bullish signals aligned)
Score >= 2:  BUY (Positive momentum detected)
Score >= 0:  HOLD (Mixed signals, wait for clarity)
Score <= -2: SELL (Negative indicators present)
Score <= -4: STRONG SELL (Multiple bearish signals)
The AI provides detailed explanations of bullish and bearish signals, helping users understand the reasoning behind each recommendation.

## Design Philosophy
Color Palette

Background: #0a0a0f (Deep Black)
Elevated Surfaces: #1f1f2e (Dark Gray)
Accent Gold: #fbbf24
Accent Emerald: #10b981
Profit Green: #10b981
Loss Red: #ef4444

Key Design Principles

Minimalist Trading Floor Aesthetic - Inspired by Bloomberg Terminal
Data-Dense yet Beautiful - Maximum information, minimal clutter
Professional Polish - Enterprise-grade UI/UX patterns
Unique Identity - Completely different from typical blue gradient portfolios

Advanced CSS Features

3D perspective transforms for card tilt effects
Keyframe animations for particles, ticker, confetti
Custom cursor with crosshair precision mode
Holographic shimmer effects with animated gradients
Progressive data loading with skeleton states


## Deployment
Deploy Frontend to Vercel
bashcd frontend
vercel --prod
Vercel automatically:

Builds the React app
Deploys to CDN
Provides HTTPS domain
Auto-deploys on Git push

Deploy Backend to Railway

Go to https://railway.app
Click "Deploy from GitHub repo"
Select stock-analysis-tool repository
Add environment variables:

PORT=5000
MONGODB_URI=your_connection_string
ALPHA_VANTAGE_API_KEY=your_api_key


Railway auto-deploys on Git push

Database (MongoDB Atlas)

Create free cluster at https://cloud.mongodb.com
Create database user with password
Whitelist IP addresses (or use 0.0.0.0/0 for development)
Copy connection string to .env


## API Rate Limits & Optimization
Alpha Vantage Free Tier

5 calls per minute
500 calls per day

Optimization Strategies Implemented

Sequential Loading - 13-second delays between API calls
Timer Cancellation - Cancel pending requests when user switches stocks
Progressive UI Updates - Show data as it loads (quote → chart → AI)
Demo Mode - Bypass API limits for portfolio showcase
Error Handling - Graceful degradation with user-friendly messages


## Learning Outcomes
This project demonstrates proficiency in:
✅ Full-Stack Development - MERN stack (MongoDB, Express, React, Node.js)
✅ External API Integration - Real-time data fetching and processing
✅ Rate Limit Management - Sophisticated handling of API constraints
✅ Advanced CSS - 3D transforms, animations, custom effects
✅ Real-Time Data Processing - Technical indicator calculations
✅ AI/ML Implementation - Multi-factor recommendation engine
✅ Professional UI/UX - Bloomberg Terminal-inspired design
✅ Cloud Deployment - Vercel, Railway, MongoDB Atlas
✅ RESTful API Design - Clean, scalable backend architecture

## Future Enhancements

 WebSocket integration for real-time price updates
 Email/SMS price alerts
 Historical backtesting of recommendations
 News sentiment analysis with NLP
 Social features (share watchlists)
 Mobile app version (React Native)
 Multiple portfolio support
 Advanced charting (candlestick, indicators overlay)


## License
MIT License - Feel free to use this project for learning and portfolio purposes.

## Author
Valerie Dawson
Full-Stack Developer | Cloud Engineer | Computer Science Graduate

Portfolio: https://portfolio-jk0ukypza-rubysage20s-projects.vercel.app/
LinkedIn: https://linkedin.com/in/valerie-dawson-se
GitHub: https://github.com/Rubysage20
Email: Valeriedawson513@gmail.com


 Acknowledgments

Alpha Vantage - Stock market data API
React Team - Amazing frontend framework
Recharts - Beautiful data visualization library
MongoDB - Flexible NoSQL database
Vercel & Railway - Seamless deployment platforms


Notes
This is a portfolio project demonstrating full-stack development skills. The demo version uses test data for reliability, while the complete API integration code showcases production-ready development practices including error handling, rate limiting, and progressive loading strategies.
For questions or collaboration opportunities, feel free to reach out!

⭐ Star this repo if you found it helpful!
🐛 Found a bug? Open an issue!
💡 Have suggestions? Create a pull request!