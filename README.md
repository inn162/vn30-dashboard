# VN30 Live Market Intelligence Dashboard
**Yen Tran | Take-Home Project — AI Automation Analyst | 20in20 Partners**

Live market dashboard for all 30 VN30 constituents on HOSE. Fetches real-time prices, calculates valuation multiples, and visualizes 30-day price history, 52-week positioning, and index contribution.

## Features
- Live prices and % change for all 30 VN30 stocks via vnstock/VCI
- P/E, P/B, EV/EBITDA calculated from live prices + annual report financials
- 52-week range bars and % from 52-week high
- Index contribution per constituent (% chg × index weight)
- Sector heatmap with tile size proportional to market cap
- 30-day rolling chart per stock with hover crosshair
- Excel export + 30-stock chart grid PNG

## Architecture

\`\`\`
vn30_live.py  →  public/data.json  →  React App (localhost:3000)
     ↓
  Excel + Chart PNG (~/Downloads)
\`\`\`

- **Python script** fetches 30-day OHLCV history per stock via vnstock (VCI source), calculates multiples, writes data.json to the React public folder
- **React app** reads data.json on load and renders live data across 4 views: All Stocks, 30-Day Charts, Sector Heatmap, Index Contribution
- Rate limit handling: vnstock free tier = 20 req/min — script sleeps 3.5s between requests

## Setup

### Requirements
- Node.js 16+
- Python 3.10+

### Install
\`\`\`bash
git clone https://github.com/inn162/vn30-dashboard.git
cd vn30-dashboard
npm install
/opt/homebrew/bin/pip3.10 install vnstock ipython pandas matplotlib openpyxl
\`\`\`

### Run
\`\`\`bash
# Step 1 — Fetch live data (~4 min)
/opt/homebrew/bin/python3.10 vn30_live.py

# Step 2 — Start dashboard
npm start
\`\`\`

Open http://localhost:3000

## Data Sources
- Prices + history: vnstock library (VCI source) — free, no API key required
- Valuation multiples: calculated from live price x static financials (EPS, BVPS, Net Debt, EBITDA from latest annual reports)

## Cost
$0 — all open source, free API tier
