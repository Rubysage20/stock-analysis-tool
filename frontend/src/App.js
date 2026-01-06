import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, ResponsiveContainer
} from 'recharts';
import {
  Search, Activity, Zap, Target, Bell, X
} from 'lucide-react';
import './App.css';

const API_URL = 'https://stockanalysistool-production.up.railway.app/api';

// Global timers for cancellation
let chartTimeout = null;
let recommendationTimeout = null;

// ========================================
// CUSTOM CURSOR COMPONENT
// ========================================
function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      className={`custom-cursor ${isActive ? 'active' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    />
  );
}

// ========================================
// PARTICLE BACKGROUND
// ========================================
function ParticleBackground() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 20}s`,
    size: Math.random() * 3 + 1
  }));

  return (
    <div className="app-background">
      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.animationDelay,
              width: `${p.size}px`,
              height: `${p.size}px`
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ========================================
// CONFETTI ANIMATION
// ========================================
function Confetti({ trigger }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 0.5,
      color: ['#fbbf24', '#10b981', '#06b6d4', '#a855f7'][Math.floor(Math.random() * 4)]
    }));

    setConfetti(pieces);

    const timer = setTimeout(() => setConfetti([]), 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="confetti-container">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`
          }}
        />
      ))}
    </div>
  );
}

// ========================================
// SPARKLINE COMPONENT
// ========================================
function Sparkline({ data, positive }) {
  if (!data || data.length === 0) return null;

  const width = 100;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        className={`sparkline-path ${positive ? 'positive' : 'negative'}`}
        points={points}
      />
    </svg>
  );
}

// ========================================
// 3D TILT CARD COMPONENT
// ========================================
function TiltCard({ children, className = '', style = {} }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// ========================================
// PREMIUM TOAST
// ========================================
function PremiumToast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`premium-toast toast ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? '✓' : '✕'}
      </div>
      <div className="toast-content">
        <div className="toast-title">{type === 'success' ? 'Success' : 'Error'}</div>
        <div className="toast-message">{message}</div>
      </div>
      <button onClick={onClose} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
}

// ========================================
// HEAT MAP CELL
// ========================================
function HeatMapCell({ symbol, change, onClick }) {
  const getClassName = () => {
    const absChange = Math.abs(change);
    if (change > 0) {
      return absChange > 3 ? 'profit-high' : 'profit-low';
    } else {
      return absChange > 3 ? 'loss-high' : 'loss-low';
    }
  };

  return (
    <div className={`heat-cell ${getClassName()}`} onClick={onClick}>
      <div className="heat-symbol">{symbol}</div>
      <div className={`heat-change ${change > 0 ? 'positive' : 'negative'}`}>
        {change > 0 ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
  );
}

// ========================================
// PREMIUM MODAL
// ========================================
function PremiumModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '600px',
          width: '90%',
          position: 'relative',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '1.5rem',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--bg-elevated)'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3.5rem',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-emerald))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '900',
            marginBottom: '1rem',
            letterSpacing: '2px'
          }}>
            PREMIUM
          </div>
          
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '2rem',
            marginBottom: '1rem',
            fontWeight: '700'
          }}>
            Unlock Advanced Features
          </h2>

          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '2.5rem',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            Get unlimited access to real-time data, advanced analytics, and AI-powered insights
          </p>

          <div style={{ 
            display: 'grid', 
            gap: '1rem',
            textAlign: 'left',
            marginBottom: '2.5rem'
          }}>
            {[
              { icon: '⚡', text: 'Real-time stock prices (zero delay)' },
              { icon: '🔓', text: 'Unlimited stock analysis' },
              { icon: '📊', text: 'Advanced technical indicators' },
              { icon: '🔔', text: 'Price alerts & notifications' },
              { icon: '💼', text: 'Advanced portfolio analytics' },
              { icon: '📰', text: 'AI news sentiment analysis' },
              { icon: '🎯', text: 'Custom watchlists & filters' },
              { icon: '📈', text: 'Export reports & data' }
            ].map((feature, idx) => (
              <div key={idx} style={{ 
                color: 'var(--text-primary)',
                fontSize: '1rem',
                padding: '1rem 1.5rem',
                background: 'var(--bg-elevated)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid var(--border-subtle)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
              >
                <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <div style={{ 
            fontSize: '3.5rem',
            fontWeight: '900',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            $9.99
            <span style={{ 
              fontSize: '1.5rem', 
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>/month</span>
          </div>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            marginBottom: '2rem'
          }}>
            Cancel anytime • 30-day money-back guarantee
          </p>

          <button
            style={{
              background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-emerald))',
              border: 'none',
              color: 'var(--bg-primary)',
              padding: '1.2rem 3rem',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              width: '100%',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: 'var(--glow-gold)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              alert('💳 Payment integration coming soon!\n\nThis is a portfolio demo project.\n\nIn production, this would connect to Stripe or PayPal.');
              onClose();
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ⚡ Upgrade to Premium
          </button>

          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.85rem',
            marginTop: '1.5rem',
            fontStyle: 'italic'
          }}>
            🎨 This is a portfolio demo. No actual payment will be processed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================================
// MAIN APP
// ========================================
function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [comparisonStock, setComparisonStock] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [marketStats] = useState({
    sp500: { value: 4783.45, change: 0.85 },
    nasdaq: { value: 15073.26, change: 1.23 },
    dow: { value: 37545.33, change: 0.51 }
  });
  const [tickerStocks, setTickerStocks] = useState([]);
  const [heatMapData, setHeatMapData] = useState([]);

  // Show Toast
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initialize ticker and heat map with LIVE data
  useEffect(() => {
    const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
    
    const fetchMarketData = async () => {
      console.log('🔍 Loading LIVE market data...');
      showToast('Loading live market data...');
      
      const validStocks = [];
      
      for (let i = 0; i < popularStocks.length; i++) {
        const symbol = popularStocks[i];
        
        try {
          if (i > 0) {
            console.log(`⏳ Waiting 13 seconds before loading ${symbol}...`);
            await new Promise(resolve => setTimeout(resolve, 13000));
          }
          
          console.log(`📊 Loading ${symbol}...`);
          const res = await axios.get(`${API_URL}/stocks/quote/${symbol}`);
          
          const stockData = {
            symbol: res.data.symbol,
            price: res.data.price,
            change: parseFloat(res.data.changePercent.replace('%', '')),
            data: Array.from({ length: 20 }, () => res.data.price + Math.random() * 10 - 5)
          };
          
          validStocks.push(stockData);
          setTickerStocks([...validStocks]);
          setHeatMapData([...validStocks]);
          
          console.log(`✅ Loaded ${symbol}: $${res.data.price}`);
          showToast(`Loaded ${symbol} - ${validStocks.length}/${popularStocks.length}`);
          
        } catch (err) {
          console.error(`❌ Error loading ${symbol}:`, err.response?.data?.error || err.message);
          
          if (err.response?.data?.error?.includes('rate limit')) {
            console.log('⏸️ Rate limit hit - stopping early');
            showToast('API rate limit reached. Showing partial data.', 'error');
            break;
          }
        }
      }
      
      console.log(`🎉 Finished loading ${validStocks.length} stocks with LIVE data`);
    };

    fetchMarketData();
  }, [showToast]);

  // Search stock with timer cancellation
  const handleSearch = async (e, symbol = null) => {
    if (e) e.preventDefault();
    const searchSymbol = symbol || searchTerm;
    if (!searchSymbol.trim()) return;

    // CANCEL any pending background loads
    if (chartTimeout) {
      clearTimeout(chartTimeout);
      chartTimeout = null;
    }
    if (recommendationTimeout) {
      clearTimeout(recommendationTimeout);
      recommendationTimeout = null;
    }

    setLoading(true);
    setStockData(null);
    setChartData([]);
    setRecommendation(null);
    setLoadingChart(true);
    setLoadingRecommendation(true);

    try {
      console.log(`🔍 Searching for ${searchSymbol}...`);
      
      // STEP 1: Load quote (no delay)
      const quoteRes = await axios.get(`${API_URL}/stocks/quote/${searchSymbol}`);
      setStockData(quoteRes.data);
      setSelectedStock(searchSymbol.toUpperCase());
      setLoading(false);
      showToast(`Loaded ${searchSymbol}!`);
      
      // STEP 2: Load chart in background (13 sec delay)
      chartTimeout = setTimeout(async () => {
        try {
          console.log(`📊 Loading chart for ${searchSymbol}...`);
          const chartRes = await axios.get(`${API_URL}/stocks/chart/${searchSymbol}`);
          setChartData(chartRes.data.slice(-30));
          setLoadingChart(false);
          showToast('Chart loaded!');
          
          // STEP 3: Load recommendation (another 13 sec delay)
          recommendationTimeout = setTimeout(async () => {
            try {
              console.log(`🤖 Loading AI analysis for ${searchSymbol}...`);
              const recRes = await axios.get(`${API_URL}/stocks/recommendation/${searchSymbol}`);
              setRecommendation(recRes.data);
              setLoadingRecommendation(false);
              
              if (recRes.data.recommendation.action.includes('BUY')) {
                setConfettiTrigger(prev => prev + 1);
              }
              
              showToast('AI analysis complete!', 'success');
            } catch (err) {
              console.error('Recommendation error:', err.response?.data?.error || err.message);
              setLoadingRecommendation(false);
              showToast('Could not load AI recommendation (rate limit)', 'error');
            }
          }, 13000);
          
        } catch (err) {
          console.error('Chart error:', err.response?.data?.error || err.message);
          setLoadingChart(false);
          showToast('Could not load chart (rate limit)', 'error');
        }
      }, 13000);
      
    } catch (err) {
      setLoading(false);
      setLoadingChart(false);
      setLoadingRecommendation(false);
      console.error('Quote error:', err);
      
      const errorMsg = err.response?.data?.error || err.message;
      
      if (errorMsg.includes('Invalid symbol') || errorMsg.includes('no data available')) {
        showToast(`Stock symbol "${searchSymbol}" not found`, 'error');
      } else if (errorMsg.includes('rate limit')) {
        showToast('API rate limit reached. Wait 1 minute.', 'error');
      } else {
        showToast('Error loading stock', 'error');
      }
    }
  };

  // Add comparison stock
  const handleAddComparison = async (symbol) => {
    try {
      const [quoteRes, chartRes] = await Promise.all([
        axios.get(`${API_URL}/stocks/quote/${symbol}`),
        axios.get(`${API_URL}/stocks/chart/${symbol}`)
      ]);

      setComparisonStock(symbol);
      setComparisonData({
        ...quoteRes.data,
        chartData: chartRes.data.slice(-30)
      });
      
      showToast(`Added ${symbol} for comparison!`);
    } catch (err) {
      showToast('Error loading comparison stock', 'error');
    }
  };

  return (
    <div className="App">
      <CustomCursor />
      <ParticleBackground />
      <Confetti trigger={confettiTrigger} />

      {/* Premium Modal */}
      <PremiumModal 
        isOpen={premiumModalOpen} 
        onClose={() => setPremiumModalOpen(false)} 
      />

      {/* Toast Stack */}
      <div className="toast-stack">
        {toasts.map(toast => (
          <PremiumToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Premium Header */}
      <header className="premium-header">
        <div className="header-grid">
          <div className="logo-section">
            <div className="logo-icon">
              <Activity />
            </div>
            <div className="logo-text">
              <h1>NEXUS TRADING</h1>
              <p>Premium Analytics Platform</p>
            </div>
          </div>

          <div className="market-stats">
            <div className="stat-item">
              <span className="stat-label">S&P 500</span>
              <span className={`stat-value ${marketStats.sp500.change > 0 ? 'positive' : 'negative'}`}>
                {marketStats.sp500.value.toFixed(2)} ({marketStats.sp500.change > 0 ? '+' : ''}{marketStats.sp500.change}%)
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">NASDAQ</span>
              <span className={`stat-value ${marketStats.nasdaq.change > 0 ? 'positive' : 'negative'}`}>
                {marketStats.nasdaq.value.toFixed(2)} ({marketStats.nasdaq.change > 0 ? '+' : ''}{marketStats.nasdaq.change}%)
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">DOW JONES</span>
              <span className={`stat-value ${marketStats.dow.change > 0 ? 'positive' : 'negative'}`}>
                {marketStats.dow.value.toFixed(2)} ({marketStats.dow.change > 0 ? '+' : ''}{marketStats.dow.change}%)
              </span>
            </div>
          </div>

          <div className="header-actions">
            <button className="action-btn">
              <Bell size={18} />
              Alerts
            </button>
            <button 
              className="action-btn premium"
              onClick={() => setPremiumModalOpen(true)}
            >
              <Zap size={18} />
              Go Premium
            </button>
          </div>
        </div>
      </header>

      {/* Live Ticker */}
      {tickerStocks.length > 0 && (
        <div className="premium-ticker">
          <div className="ticker-track">
            {[...tickerStocks, ...tickerStocks].map((stock, idx) => (
              <div key={idx} className="ticker-stock">
                <span className="ticker-symbol">{stock.symbol}</span>
                <span className="ticker-price">${stock.price.toFixed(2)}</span>
                <span className={`ticker-change ${stock.change > 0 ? 'up' : 'down'}`}>
                  {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </span>
                <div className="ticker-sparkline">
                  <Sparkline data={stock.data} positive={stock.change > 0} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
        {/* Premium Search */}
        <div className="premium-search">
          <form onSubmit={handleSearch} className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Enter stock symbol (AAPL, MSFT, TSLA)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'ANALYZING...' : 'ANALYZE'}
            </button>
          </form>

          <div className="quick-actions">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quick Access:</span>
            {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META'].map(symbol => (
              <button
                key={symbol}
                className="quick-chip"
                onClick={() => { setSearchTerm(symbol); handleSearch(null, symbol); }}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Heat Map */}
        {heatMapData.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Market Heat Map
            </h2>
            <div className="heat-map">
              {heatMapData.map(stock => (
                <HeatMapCell
                  key={stock.symbol}
                  symbol={stock.symbol}
                  change={stock.change}
                  onClick={() => handleSearch(null, stock.symbol)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Split Screen Comparison */}
        {stockData && (
          <div style={{ marginTop: '3rem' }}>
            <div className="split-screen">
              {/* Main Stock */}
              <TiltCard>
                <div className="panel-header">
                  <div className="panel-symbol">{stockData.symbol}</div>
                  <div className="panel-price">${stockData.price.toFixed(2)}</div>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>CHANGE</span>
                      <div style={{ 
                        color: stockData.change >= 0 ? 'var(--profit)' : 'var(--loss)',
                        fontSize: '1.5rem',
                        fontWeight: '700'
                      }}>
                        {stockData.changePercent}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VOLUME</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {(stockData.volume / 1000000).toFixed(2)}M
                      </div>
                    </div>
                  </div>
                </div>

                {loadingChart && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    <div>Loading chart...</div>
                  </div>
                )}

                {chartData.length > 0 && !loadingChart && (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="close" stroke="#10b981" fill="url(#colorPrice1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}

                {!comparisonStock && (
                  <button
                    onClick={() => {
                      const symbol = prompt('Enter stock symbol to compare:');
                      if (symbol) handleAddComparison(symbol.toUpperCase());
                    }}
                    style={{
                      marginTop: '1rem',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    + Add Comparison
                  </button>
                )}
              </TiltCard>

              {/* Comparison Stock */}
              {comparisonData && (
                <TiltCard>
                  <div className="panel-header">
                    <div className="panel-symbol">{comparisonStock}</div>
                    <div className="panel-price">${comparisonData.price.toFixed(2)}</div>
                  </div>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>CHANGE</span>
                        <div style={{ 
                          color: comparisonData.change >= 0 ? 'var(--profit)' : 'var(--loss)',
                          fontSize: '1.5rem',
                          fontWeight: '700'
                        }}>
                          {comparisonData.changePercent}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VOLUME</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {(comparisonData.volume / 1000000).toFixed(2)}M
                        </div>
                      </div>
                    </div>
                  </div>

                  {comparisonData.chartData && (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={comparisonData.chartData}>
                        <defs>
                          <linearGradient id="colorPrice2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="close" stroke="#fbbf24" fill="url(#colorPrice2)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  <button
                    onClick={() => {
                      setComparisonStock(null);
                      setComparisonData(null);
                    }}
                    style={{
                      marginTop: '1rem',
                      background: 'transparent',
                      border: '1px solid var(--loss)',
                      color: 'var(--loss)',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    Remove Comparison
                  </button>
                </TiltCard>
              )}
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        {loadingRecommendation && !recommendation && (
          <div style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <div style={{ fontSize: '1.2rem' }}>Analyzing with AI...</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Loading technical indicators...</div>
          </div>
        )}

        {recommendation && !loadingRecommendation && (
          <TiltCard style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.8rem', 
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <Target size={32} />
                AI Recommendation
              </h3>
              <div style={{
                padding: '1rem 2rem',
                borderRadius: '30px',
                background: recommendation.recommendation.color,
                color: '#fff',
                fontWeight: '800',
                fontSize: '1.2rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {recommendation.recommendation.action}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {recommendation.recommendation.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              <div style={{ 
                background: 'var(--bg-elevated)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>RSI</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {recommendation.indicators.rsi.value.toFixed(2)}
                </div>
              </div>
              <div style={{ 
                background: 'var(--bg-elevated)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>MACD</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {recommendation.indicators.macd.macd.toFixed(2)}
                </div>
              </div>
              <div style={{ 
                background: 'var(--bg-elevated)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>TREND</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {recommendation.indicators.trend.type}
                </div>
              </div>
            </div>
          </TiltCard>
        )}
      </main>

      {/* Premium Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem',
        textAlign: 'center',
        marginTop: '4rem'
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          © 2025 Nexus Trading | Built by Valerie Dawson
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          React • Node.js • MongoDB • Alpha Vantage • Premium Design
        </p>
      </footer>
    </div>
  );
}

export default App;