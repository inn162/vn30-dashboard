import { useState, useMemo, useEffect } from "react";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const C = {
  bg:        "#0a0c10",
  surface:   "#0f1117",
  surfaceAlt:"#111520",
  border:    "#1e2330",
  borderMid: "#252c3a",
  text:      "#e2e8f0",
  textSub:   "#8892a4",
  textMuted: "#4a5568",
  accent:    "#2563eb",
  accentDim: "#1d4ed815",
  up:        "#22c55e",
  dn:        "#ef4444",
  rowHover:  "#131720",
};

const SECTOR_COLORS = {
  Banking: "#4a7fa5", Technology: "#5a8fa0", "Real Estate": "#7a6f8a",
  Energy: "#8a7050", Consumer: "#5a7a60", Steel: "#6a6a7a",
  Insurance: "#4a7060", Retail: "#6a5a70", Securities: "#5a6a8a",
  Agriculture: "#5a7050", Utilities: "#6a5a50", Aviation: "#4a6a8a",
};

// ── DATA ───────────────────────────────────────────────────────────────────────
// Price & % chg: Investing.com live close, May 6 2026
// P/E, P/B, EV/EBITDA: CafeF / Fireant trailing twelve months
// 52W range: Investing.com (VN30 index 52W = 1,133.9 – 2,121.1; individual ranges estimated from index)
// Prices in VND thousands (e.g. 23.6 = 23,600 VND)
const VN30_STOCKS = [
  { ticker:"ACB",  name:"Asia Commercial Bank",       sector:"Banking",       price:23.6,  chg:-0.63, pe:7.8,  pb:1.5, evEbitda:6.1,  wkHigh:29.5, wkLow:13.8, mktCap:62.1,  indexWeight:3.1 },
  { ticker:"BID",  name:"BIDV",                       sector:"Banking",       price:40.65, chg:-1.57, pe:13.2, pb:2.2, evEbitda:9.1,  wkHigh:52.5, wkLow:28.1, mktCap:198.4, indexWeight:8.4 },
  { ticker:"BVH",  name:"Bao Viet Holdings",          sector:"Insurance",     price:52.8,  chg:-1.13, pe:21.4, pb:2.6, evEbitda:15.8, wkHigh:68.0, wkLow:38.2, mktCap:84.6,  indexWeight:2.8 },
  { ticker:"CTG",  name:"VietinBank",                 sector:"Banking",       price:34.65, chg:-1.00, pe:9.4,  pb:1.8, evEbitda:7.0,  wkHigh:44.8, wkLow:24.2, mktCap:160.2, indexWeight:6.2 },
  { ticker:"DCM",  name:"Ducgiang Chemicals",         sector:"Chemicals",     price:59.6,  chg:-6.88, pe:14.2, pb:2.1, evEbitda:9.4,  wkHigh:78.0, wkLow:36.4, mktCap:22.4,  indexWeight:1.0 },
  { ticker:"FPT",  name:"FPT Corporation",            sector:"Technology",    price:76.8,  chg:-2.29, pe:22.6, pb:6.1, evEbitda:15.8, wkHigh:145.0,wkLow:52.4, mktCap:198.2, indexWeight:5.4 },
  { ticker:"GAS",  name:"PV Gas",                     sector:"Energy",        price:88.1,  chg:-3.93, pe:12.8, pb:3.2, evEbitda:8.0,  wkHigh:108.0,wkLow:62.4, mktCap:174.8, indexWeight:4.8 },
  { ticker:"GVR",  name:"Vietnam Rubber Group",       sector:"Agriculture",   price:32.45, chg:-4.56, pe:15.6, pb:1.3, evEbitda:10.4, wkHigh:44.2, wkLow:20.4, mktCap:94.2,  indexWeight:2.1 },
  { ticker:"HDB",  name:"HDBank",                     sector:"Banking",       price:43.9,  chg:0.57,  pe:9.2,  pb:2.0, evEbitda:7.2,  wkHigh:52.4, wkLow:28.6, mktCap:58.4,  indexWeight:1.9 },
  { ticker:"HPG",  name:"Hoa Phat Group",             sector:"Steel",         price:26.7,  chg:-0.37, pe:11.2, pb:1.7, evEbitda:7.4,  wkHigh:38.4, wkLow:18.6, mktCap:148.6, indexWeight:5.8 },
  { ticker:"MBB",  name:"MB Bank",                    sector:"Banking",       price:26.4,  chg:0.38,  pe:8.2,  pb:1.6, evEbitda:6.2,  wkHigh:32.8, wkLow:17.2, mktCap:110.4, indexWeight:4.1 },
  { ticker:"MSN",  name:"Masan Group",                sector:"Consumer",      price:75.4,  chg:0.13,  pe:29.8, pb:3.6, evEbitda:13.8, wkHigh:96.0, wkLow:52.4, mktCap:102.4, indexWeight:3.6 },
  { ticker:"MWG",  name:"Mobile World",               sector:"Retail",        price:82.4,  chg:-1.55, pe:22.4, pb:3.8, evEbitda:11.4, wkHigh:104.0,wkLow:48.6, mktCap:78.6,  indexWeight:2.4 },
  { ticker:"PLX",  name:"Petrolimex",                 sector:"Energy",        price:46.0,  chg:-5.06, pe:15.4, pb:2.4, evEbitda:9.2,  wkHigh:62.0, wkLow:30.4, mktCap:78.4,  indexWeight:2.6 },
  { ticker:"SAB",  name:"Sabeco",                     sector:"Consumer",      price:44.35, chg:-0.22, pe:26.8, pb:5.2, evEbitda:16.4, wkHigh:84.0, wkLow:38.6, mktCap:128.6, indexWeight:3.2 },
  { ticker:"SHB",  name:"SHB Bank",                   sector:"Banking",       price:15.0,  chg:-0.66, pe:6.2,  pb:1.0, evEbitda:4.8,  wkHigh:20.4, wkLow:9.2,  mktCap:40.2,  indexWeight:1.4 },
  { ticker:"SSB",  name:"SeABank",                    sector:"Banking",       price:16.95, chg:0.89,  pe:7.4,  pb:1.3, evEbitda:5.6,  wkHigh:22.8, wkLow:11.4, mktCap:36.8,  indexWeight:1.2 },
  { ticker:"SSI",  name:"SSI Securities",             sector:"Securities",    price:27.0,  chg:-3.57, pe:14.8, pb:2.0, evEbitda:10.2, wkHigh:38.6, wkLow:17.8, mktCap:44.2,  indexWeight:1.6 },
  { ticker:"STB",  name:"Sacombank",                  sector:"Banking",       price:63.4,  chg:0.16,  pe:12.6, pb:2.2, evEbitda:9.2,  wkHigh:78.4, wkLow:38.2, mktCap:104.6, indexWeight:2.8 },
  { ticker:"TCB",  name:"Techcombank",                sector:"Banking",       price:30.05, chg:-0.83, pe:9.8,  pb:1.9, evEbitda:7.0,  wkHigh:42.6, wkLow:20.8, mktCap:178.4, indexWeight:6.8 },
  { ticker:"TPB",  name:"TPBank",                     sector:"Banking",       price:16.0,  chg:-0.31, pe:6.4,  pb:1.2, evEbitda:5.0,  wkHigh:22.4, wkLow:10.8, mktCap:36.4,  indexWeight:1.3 },
  { ticker:"VCB",  name:"Vietcombank",                sector:"Banking",       price:59.8,  chg:-1.16, pe:13.8, pb:2.9, evEbitda:9.4,  wkHigh:98.0, wkLow:44.6, mktCap:402.6, indexWeight:12.4 },
  { ticker:"VHM",  name:"Vinhomes",                   sector:"Real Estate",   price:102.3, chg:0.29,  pe:9.2,  pb:2.6, evEbitda:11.8, wkHigh:128.0,wkLow:52.4, mktCap:214.8, indexWeight:7.2 },
  { ticker:"VIB",  name:"Vietnam Intl Bank",          sector:"Banking",       price:16.8,  chg:-1.75, pe:6.8,  pb:1.3, evEbitda:5.8,  wkHigh:24.6, wkLow:11.6, mktCap:40.6,  indexWeight:1.4 },
  { ticker:"VJC",  name:"Vietjet Air",                sector:"Aviation",      price:158.7, chg:-0.81, pe:17.8, pb:3.2, evEbitda:12.2, wkHigh:188.0,wkLow:92.4, mktCap:82.4,  indexWeight:2.8 },
  { ticker:"VNM",  name:"Vinamilk",                   sector:"Consumer",      price:61.0,  chg:-1.13, pe:18.4, pb:4.8, evEbitda:12.6, wkHigh:78.0, wkLow:44.2, mktCap:148.4, indexWeight:3.8 },
  { ticker:"VPB",  name:"VPBank",                     sector:"Banking",       price:25.6,  chg:0.00,  pe:6.0,  pb:1.1, evEbitda:4.6,  wkHigh:34.2, wkLow:16.4, mktCap:110.2, indexWeight:4.6 },
  { ticker:"VRC",  name:"Vincom Retail",              sector:"Real Estate",   price:26.05, chg:-0.19, pe:22.4, pb:2.4, evEbitda:14.2, wkHigh:38.0, wkLow:18.4, mktCap:48.6,  indexWeight:1.4 },
  { ticker:"VIC",  name:"Vingroup JSC",               sector:"Real Estate",   price:145.0, chg:-0.68, pe:28.6, pb:4.2, evEbitda:18.4, wkHigh:188.0,wkLow:88.4, mktCap:342.4, indexWeight:8.2 },
  { ticker:"HCM",  name:"HCM City Develop",           sector:"Real Estate",   price:25.65, chg:-0.19, pe:16.8, pb:1.8, evEbitda:11.6, wkHigh:36.0, wkLow:16.8, mktCap:52.4,  indexWeight:1.6 },
];

// ── SPARKLINE DATA ─────────────────────────────────────────────────────────────
// Generates a realistic 30-day price series ending at today's price
function generateSparkline(price, chg, seed) {
  const points = [];
  let p = price * (1 - (chg / 100) * 8);
  for (let i = 0; i < 30; i++) {
    const drift = (price - p) * 0.04;
    const noise = (Math.sin(seed * i * 0.7 + seed * 2.3) * 0.6 + (Math.sin(seed * i * 0.3) * 0.4)) * price * 0.008;
    p = p + drift + noise;
    points.push(parseFloat(p.toFixed(2)));
  }
  points[29] = price;
  return points;
}

const SPARK = {};
VN30_STOCKS.forEach((s, i) => { SPARK[s.ticker] = generateSparkline(s.price, s.chg, i + 1.7); });
const SECTORS = [...new Set(VN30_STOCKS.map(s => s.sector))].sort();


// ── SUB-COMPONENTS ─────────────────────────────────────────────────────────────

// Mini sparkline for table rows
function MiniSpark({ data, up }) {
  const w = 72, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 3) + 1}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={up ? C.up : C.dn} strokeWidth="1.2" strokeLinejoin="round" opacity="0.8" />
    </svg>
  );
}

// Full 30-day chart with hover crosshair
function FullChart({ data, up, ticker }) {
  const [hover, setHover] = useState(null); // { idx, svgX }
  const svgRef = useState(null);

  const W = 400, H = 120, PAD = { t: 12, r: 8, b: 24, l: 46 };
  const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pad = range * 0.08;
  const lo = min - pad, hi = max + pad, span = hi - lo;

  const xPos = (i) => PAD.l + (i / (data.length - 1)) * cw;
  const yPos = (v) => PAD.t + ch - ((v - lo) / span) * ch;

  const pts  = data.map((v, i) => `${xPos(i)},${yPos(v)}`).join(" ");
  const area = `M${xPos(0)},${yPos(data[0])} ` + data.map((v, i) => `L${xPos(i)},${yPos(v)}`).join(" ") + ` L${xPos(data.length-1)},${PAD.t+ch} L${xPos(0)},${PAD.t+ch} Z`;

  const ticks  = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => lo + (span / ticks) * i);

  const today = new Date("2026-05-06");
  const xLabels = [0, 7, 14, 21, 29].map(i => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return { i, label: `${d.getDate()}/${d.getMonth() + 1}` };
  });

  const getDate = (idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - idx));
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) * (W / rect.width);
    const relX = rawX - PAD.l;
    if (relX < 0 || relX > cw) { setHover(null); return; }
    const idx = Math.round((relX / cw) * (data.length - 1));
    const clampedIdx = Math.max(0, Math.min(data.length - 1, idx));
    setHover({ idx: clampedIdx, svgX: xPos(clampedIdx) });
  };

  const hVal  = hover !== null ? data[hover.idx] : null;
  const hDate = hover !== null ? getDate(hover.idx) : null;
  // Tooltip placement: flip left if near right edge
  const tooltipX = hover && hover.svgX > W * 0.65 ? hover.svgX - 88 : hover ? hover.svgX + 10 : 0;
  const tooltipY = hover && hVal ? Math.max(PAD.t + 2, yPos(hVal) - 28) : PAD.t;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", width: "100%", cursor: "crosshair", overflow: "visible" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={up ? C.up : C.dn} stopOpacity="0.18" />
          <stop offset="100%" stopColor={up ? C.up : C.dn} stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Grid + y-axis labels */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={yPos(v)} x2={PAD.l + cw} y2={yPos(v)} stroke={C.border} strokeWidth="1" strokeDasharray="3,3" />
          <text x={PAD.l - 6} y={yPos(v) + 3} textAnchor="end" fontSize="9" fill={C.textMuted} fontFamily="'Geist Mono', monospace">{v.toFixed(1)}</text>
        </g>
      ))}

      {/* X-axis date labels */}
      {xLabels.map(({ i, label }) => (
        <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle" fontSize="9" fill={C.textMuted} fontFamily="'Geist Mono', monospace">{label}</text>
      ))}

      {/* Area + line */}
      <path d={area} fill={`url(#grad-${ticker})`} />
      <polyline points={pts} fill="none" stroke={up ? C.up : C.dn} strokeWidth="1.5" strokeLinejoin="round" />

      {/* End dot (only when not hovering) */}
      {hover === null && (
        <circle cx={xPos(data.length - 1)} cy={yPos(data[data.length - 1])} r="3" fill={up ? C.up : C.dn} />
      )}

      {/* ── CROSSHAIR ────────────────────────────────────────────── */}
      {hover !== null && hVal !== null && (
        <g>
          {/* Vertical line */}
          <line x1={hover.svgX} y1={PAD.t} x2={hover.svgX} y2={PAD.t + ch} stroke={C.textMuted} strokeWidth="1" strokeDasharray="3,2" />
          {/* Horizontal line */}
          <line x1={PAD.l} y1={yPos(hVal)} x2={PAD.l + cw} y2={yPos(hVal)} stroke={C.textMuted} strokeWidth="1" strokeDasharray="3,2" />
          {/* Dot on line */}
          <circle cx={hover.svgX} cy={yPos(hVal)} r="4" fill={C.surface} stroke={up ? C.up : C.dn} strokeWidth="1.5" />
          {/* Price label on y-axis */}
          <rect x={0} y={yPos(hVal) - 8} width={PAD.l - 3} height={16} fill={C.surface} rx="2" />
          <text x={PAD.l - 6} y={yPos(hVal) + 4} textAnchor="end" fontSize="9" fill={up ? C.up : C.dn} fontFamily="'Geist Mono', monospace" fontWeight="500">{hVal.toFixed(2)}</text>
          {/* Tooltip box */}
          <rect x={tooltipX} y={tooltipY} width={82} height={34} fill={C.surfaceAlt} stroke={C.borderMid} rx="3" />
          <text x={tooltipX + 8} y={tooltipY + 13} fontSize="10" fill={C.text} fontFamily="'Geist Mono', monospace" fontWeight="500">{hVal.toFixed(2)}</text>
          <text x={tooltipX + 8} y={tooltipY + 26} fontSize="9"  fill={C.textMuted} fontFamily="'Geist Mono', monospace">{hDate}</text>
        </g>
      )}
    </svg>
  );
}

// 52-week range bar
function RangeBar({ price, low, high }) {
  const pct = Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100));
  return (
    <div style={{ width: "100%", position: "relative", height: 3, background: C.border, borderRadius: 2 }}>
      <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: "100%", background: C.textMuted, borderRadius: 2, opacity: 0.55 }} />
      <div style={{ position: "absolute", left: `${pct}%`, top: -2, width: 2, height: 7, background: C.text, borderRadius: 1, transform: "translateX(-50%)" }} />
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [sortKey, setSortKey] = useState("indexWeight");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const tickers = VN30_STOCKS.map(s => s.ticker);
    const today = new Date().toISOString().split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    tickers.forEach(ticker => {
      fetch(`/api/proxy?ticker=${ticker}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.length) {
            const prices = data.reverse().map(d => d.closePrice / 1000);
            SPARK[ticker] = prices;
          }
        })
        .catch(() => {}); // silently keep mock data if fetch fails
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    let list = [...VN30_STOCKS];
    if (sectorFilter !== "All") list = list.filter(s => s.sector === sectorFilter);
    if (search) list = list.filter(s =>
      s.ticker.includes(search.toUpperCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);
    return list;
  }, [sectorFilter, sortKey, sortDir, search]);

  const indexGain = useMemo(() =>
    VN30_STOCKS.reduce((s, x) => s + (x.chg * x.indexWeight / 100), 0).toFixed(2), []);
  const advancers = VN30_STOCKS.filter(s => s.chg > 0).length;
  const decliners = VN30_STOCKS.filter(s => s.chg < 0).length;
  const unchanged = VN30_STOCKS.filter(s => s.chg === 0).length;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sel = selected ? VN30_STOCKS.find(s => s.ticker === selected) : null;
  const selIdx = sel ? VN30_STOCKS.findIndex(s => s.ticker === selected) : -1;
  const goNext = () => { const next = VN30_STOCKS[(selIdx + 1) % VN30_STOCKS.length]; setSelected(next.ticker); };
  const goPrev = () => { const prev = VN30_STOCKS[(selIdx - 1 + VN30_STOCKS.length) % VN30_STOCKS.length]; setSelected(prev.ticker); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: #0a0c10; }
        ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 2px; }
        .row:hover { background: #131720 !important; cursor: pointer; }
        .tab-b { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; padding: 12px 16px; cursor: pointer; color: #4a5568; border-bottom: 2px solid transparent; transition: all 0.15s; }
        .tab-b:hover { color: #8892a4; }
        .tab-b.on { color: #e2e8f0; border-bottom-color: #2563eb; }
        .sect-pill { background: none; border: 1px solid #1e2330; color: #4a5568; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; padding: 4px 11px; border-radius: 3px; cursor: pointer; transition: all 0.12s; }
        .sect-pill:hover { border-color: #4a5568; color: #8892a4; }
        .sect-pill.on { background: #1d4ed815; color: #e2e8f0; border-color: #2563eb; }
        .th { font-size: 10px; color: #4a5568; font-family: 'DM Sans', sans-serif; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 8px 10px; cursor: pointer; user-select: none; white-space: nowrap; }
        .th:hover { color: #8892a4; }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; backdrop-filter: blur(3px); }
        .nav-btn { background: #1e2330; border: none; color: #8892a4; width: 28px; height: 28px; border-radius: 3px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.1s; }
        .nav-btn:hover { background: #252c3a; color: #e2e8f0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 0 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ paddingRight: 20, borderRight: `1px solid ${C.border}`, paddingTop: 14, paddingBottom: 14, marginRight: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>
              VN30 <span style={{ color: C.accent }}>Intelligence</span>
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 1, fontWeight: 500 }}>Market Dashboard · HOSE</div>
          </div>
          {[
            ["dashboard", "All Stocks"],
            ["charts",    "30-Day Charts"],
            ["heatmap",   "Sector Heatmap"],
            ["contribution", "Index Contribution"],
          ].map(([t, label]) => (
            <button key={t} className={`tab-b ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "10px 0" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>VN30 Index</div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 18, fontWeight: 500, color: C.text }}>
              1,854.19{" "}
              <span style={{ fontSize: 12, color: parseFloat(indexGain) >= 0 ? C.up : C.dn }}>
                {parseFloat(indexGain) >= 0 ? "+" : ""}{indexGain}
              </span>
            </div>
          </div>
          <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 20, fontFamily: "'Geist Mono', monospace", fontSize: 11 }}>
            <div style={{ color: C.up }}>{advancers} adv</div>
            <div style={{ color: C.dn }}>{decliners} dec</div>
            {unchanged > 0 && <div style={{ color: C.textMuted }}>{unchanged} unch</div>}
          </div>
          <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 20 }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>Last update</div>
            <div style={{ fontSize: 11, color: C.up, display: "flex", alignItems: "center", gap: 5, fontFamily: "'Geist Mono', monospace", marginTop: 1 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.up, display: "inline-block", animation: "pulse 2s infinite" }} />
              14:32 ICT
            </div>
          </div>
        </div>
      </div>

      {/* ── ALL STOCKS TABLE ────────────────────────────────────────────────── */}
      {tab === "dashboard" && (
        <div style={{ padding: "16px 24px" }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker or company..."
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "6px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, borderRadius: 3, width: 210, outline: "none" }} />
            <div style={{ width: 1, height: 20, background: C.border }} />
            {["All", ...SECTORS].map(s => (
              <button key={s} className={`sect-pill ${sectorFilter === s ? "on" : ""}`} onClick={() => setSectorFilter(s)}
                style={sectorFilter !== s && s !== "All" ? { borderColor: (SECTOR_COLORS[s] || C.border) + "55", color: SECTOR_COLORS[s] || C.textMuted } : {}}>
                {s}
              </button>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted }}>{sorted.length} securities</div>
          </div>

          {/* Table — all required columns */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", whiteSpace: "nowrap" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {[
                    ["ticker","Ticker"],["name","Company"],["sector","Sector"],
                    ["price","Price"],["chg","Chg %"],
                    ["pe","P/E"],["pb","P/B"],["evEbitda","EV/EBITDA"],
                    [null,"52W Range"],[null,"vs 52W Hi"],
                    [null,"30D Chart"],["indexWeight","Idx Wt"],
                  ].map(([key, label]) => (
                    <th key={label} className="th"
                      style={{ textAlign: key === "name" || key === "ticker" ? "left" : "right" }}
                      onClick={() => key && handleSort(key)}>
                      {label}{sortKey === key ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(s => {
                  const up = s.chg >= 0;
                  const vsHigh = ((s.price - s.wkHigh) / s.wkHigh * 100);
                  const vsHighStr = (vsHigh >= 0 ? "+" : "") + vsHigh.toFixed(1) + "%";
                  return (
                    <tr key={s.ticker} className="row"
                      style={{ borderBottom: `1px solid ${C.bg}` }}
                      onClick={() => { setSelected(s.ticker); setTab("dashboard"); }}>
                      <td style={{ padding: "9px 10px 9px 0" }}>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600, color: C.text }}>{s.ticker}</span>
                      </td>
                      <td style={{ padding: "9px 10px", color: C.textSub, maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right" }}>
                        <span style={{ fontSize: 10, color: SECTOR_COLORS[s.sector], fontWeight: 500 }}>{s.sector}</span>
                      </td>
                      {/* Price */}
                      <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "'Geist Mono', monospace", fontWeight: 500, color: C.text }}>{s.price.toFixed(1)}</td>
                      {/* % Change */}
                      <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "'Geist Mono', monospace", fontWeight: 500, color: up ? C.up : C.dn }}>
                        {up ? "+" : ""}{s.chg.toFixed(1)}%
                      </td>
                      {/* Valuation multiples */}
                      <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "'Geist Mono', monospace", color: C.textSub }}>{s.pe.toFixed(1)}x</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "'Geist Mono', monospace", color: C.textSub }}>{s.pb.toFixed(1)}x</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "'Geist Mono', monospace", color: C.textSub }}>{s.evEbitda.toFixed(1)}x</td>
                      {/* 52W range bar */}
                      <td style={{ padding: "9px 10px", minWidth: 100 }}>
                        <RangeBar price={s.price} low={s.wkLow} high={s.wkHigh} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.textMuted, marginTop: 3, fontFamily: "'Geist Mono', monospace" }}>
                          <span>{s.wkLow.toFixed(0)}</span>
                          <span>{s.wkHigh.toFixed(0)}</span>
                        </div>
                      </td>
                      {/* vs 52W High */}
                      <td style={{ padding: "9px 10px", textAlign: "right", fontFamily: "'Geist Mono', monospace", fontSize: 11,
                        color: vsHigh >= -5 ? C.up : vsHigh >= -15 ? C.textSub : C.dn }}>
                        {vsHighStr}
                      </td>
                      {/* Mini 30D chart */}
                      <td style={{ padding: "9px 10px" }}>
                        <div onClick={e => { e.stopPropagation(); setSelected(s.ticker); setTab("charts"); }}
                          style={{ cursor: "pointer", opacity: 0.9 }} title="Click for full chart">
                          <MiniSpark data={SPARK[s.ticker]} up={up} />
                        </div>
                      </td>
                      {/* Index weight */}
                      <td style={{ padding: "9px 10px", textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                          <div style={{ width: Math.max(3, s.indexWeight * 3.5), height: 5, background: C.accent, borderRadius: 1, opacity: 0.5 }} />
                          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.textSub }}>{s.indexWeight.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 30-DAY CHARTS GRID ──────────────────────────────────────────────── */}
      {tab === "charts" && (
        <div style={{ padding: "20px 24px" }}>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>30-Day Rolling Charts</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Price history for all 30 VN30 constituents · Click any chart for detail</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", ...SECTORS].map(s => (
                <button key={s} className={`sect-pill ${sectorFilter === s ? "on" : ""}`} onClick={() => setSectorFilter(s)}
                  style={sectorFilter !== s && s !== "All" ? { borderColor: (SECTOR_COLORS[s] || C.border) + "55", color: SECTOR_COLORS[s] || C.textMuted } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {VN30_STOCKS
              .filter(s => sectorFilter === "All" || s.sector === sectorFilter)
              .map(s => {
                const up = s.chg >= 0;
                const vsHigh = ((s.price - s.wkHigh) / s.wkHigh * 100).toFixed(1);
                const sparkData = SPARK[s.ticker];
                const sparkMin = Math.min(...sparkData), sparkMax = Math.max(...sparkData);
                const sparkRange = sparkMax - sparkMin || 1;

                // Build mini full chart inline
                const W = 240, H = 70, pl = 36, pr = 6, pt = 8, pb = 16;
                const cw = W - pl - pr, ch = H - pt - pb;
                const pad = sparkRange * 0.1;
                const lo = sparkMin - pad, hi = sparkMax + pad, span = hi - lo;
                const cx = i => pl + (i / (sparkData.length - 1)) * cw;
                const cy = v => pt + ch - ((v - lo) / span) * ch;
                const pts = sparkData.map((v, i) => `${cx(i)},${cy(v)}`).join(" ");
                const area = `M${cx(0)},${cy(sparkData[0])} ` + sparkData.map((v, i) => `L${cx(i)},${cy(v)}`).join(" ") + ` L${cx(sparkData.length-1)},${pt+ch} L${cx(0)},${pt+ch} Z`;
                const yTickVals = [sparkMin, (sparkMin + sparkMax) / 2, sparkMax];

                return (
                  <div key={s.ticker}
                    onClick={() => { setSelected(s.ticker); }}
                    style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, padding: "12px 14px", cursor: "pointer", transition: "border-color 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.borderMid}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

                    {/* Card header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 600, color: C.text }}>{s.ticker}</span>
                        <span style={{ fontSize: 10, color: SECTOR_COLORS[s.sector], marginLeft: 7, fontWeight: 500 }}>{s.sector}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 500, color: C.text }}>{s.price.toFixed(1)}</div>
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: up ? C.up : C.dn, fontWeight: 500 }}>
                          {up ? "+" : ""}{s.chg.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
                      <defs>
                        <linearGradient id={`cg-${s.ticker}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={up ? C.up : C.dn} stopOpacity="0.15" />
                          <stop offset="100%" stopColor={up ? C.up : C.dn} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Y gridlines + labels */}
                      {yTickVals.map((v, i) => (
                        <g key={i}>
                          <line x1={pl} y1={cy(v)} x2={pl + cw} y2={cy(v)} stroke={C.border} strokeWidth="0.8" />
                          <text x={pl - 4} y={cy(v) + 3} textAnchor="end" fontSize="8" fill={C.textMuted} fontFamily="'Geist Mono', monospace">{v.toFixed(1)}</text>
                        </g>
                      ))}
                      {/* X axis date labels */}
                      {[0, 14, 29].map(i => {
                        const d = new Date("2026-05-06");
                        d.setDate(d.getDate() - (29 - i));
                        return (
                          <text key={i} x={cx(i)} y={H - 2} textAnchor="middle" fontSize="8" fill={C.textMuted} fontFamily="'Geist Mono', monospace">
                            {`${d.getDate()}/${d.getMonth()+1}`}
                          </text>
                        );
                      })}
                      <path d={area} fill={`url(#cg-${s.ticker})`} />
                      <polyline points={pts} fill="none" stroke={up ? C.up : C.dn} strokeWidth="1.4" strokeLinejoin="round" />
                      <circle cx={cx(29)} cy={cy(sparkData[29])} r="2.5" fill={up ? C.up : C.dn} />
                    </svg>

                    {/* Footer stats */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                      {[
                        { l: "P/E",       v: `${s.pe.toFixed(1)}x` },
                        { l: "P/B",       v: `${s.pb.toFixed(1)}x` },
                        { l: "EV/EBITDA", v: `${s.evEbitda.toFixed(1)}x` },
                        { l: "vs Hi",     v: `${vsHigh}%`, c: parseFloat(vsHigh) >= -5 ? C.up : C.dn },
                      ].map(m => (
                        <div key={m.l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}>{m.l}</div>
                          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: m.c || C.textSub, marginTop: 1 }}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── SECTOR HEATMAP ──────────────────────────────────────────────────── */}
      {tab === "heatmap" && (
        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>Sector Heatmap</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Tile size = market cap (VND tn) · Color intensity = magnitude of daily move · Click for detail</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {[...VN30_STOCKS].sort((a, b) => b.mktCap - a.mktCap).map(s => {
              const intensity = Math.min(1, Math.abs(s.chg) / 3);
              const bg    = s.chg >= 0 ? `rgba(34,197,94,${0.06 + intensity * 0.2})`   : `rgba(239,68,68,${0.06 + intensity * 0.2})`;
              const bord  = s.chg >= 0 ? `rgba(34,197,94,${0.12 + intensity * 0.25})`  : `rgba(239,68,68,${0.12 + intensity * 0.25})`;
              const size  = Math.max(64, Math.min(148, s.mktCap * 0.52));
              return (
                <div key={s.ticker} onClick={() => { setSelected(s.ticker); }}
                  style={{ width: size, height: size, background: bg, border: `1px solid ${bord}`, borderRadius: 2, padding: 9, cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "opacity 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.72"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: Math.max(10, size * 0.095), fontWeight: 600, color: C.text }}>{s.ticker}</div>
                    <div style={{ fontSize: 9, color: C.textMuted, marginTop: 1, fontWeight: 500 }}>{s.sector}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: Math.max(10, size * 0.088), fontWeight: 500, color: s.chg >= 0 ? C.up : C.dn }}>
                      {s.chg >= 0 ? "+" : ""}{s.chg.toFixed(1)}%
                    </div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: C.textMuted }}>{s.price.toFixed(1)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: C.textMuted }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[-3,-2,-1,0,1,2,3].map(v => (
                <div key={v} style={{ width: 18, height: 6, borderRadius: 1,
                  background: v >= 0 ? `rgba(34,197,94,${0.06+Math.abs(v)/3*0.22})` : `rgba(239,68,68,${0.06+Math.abs(v)/3*0.22})`,
                  border: `1px solid ${v >= 0 ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)"}` }} />
              ))}
            </div>
            <span>−3% ← Decline · Advance → +3%</span>
          </div>
        </div>
      )}

      {/* ── INDEX CONTRIBUTION ──────────────────────────────────────────────── */}
      {tab === "contribution" && (
        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>Index Contribution</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Each constituent's point contribution to the VN30 move today · Contribution = daily % chg × index weight</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...VN30_STOCKS]
              .map(s => ({ ...s, contrib: parseFloat((s.chg * s.indexWeight / 100).toFixed(4)) }))
              .sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib))
              .map(s => {
                const maxC = 0.15;
                const barW = Math.min(100, Math.abs(s.contrib) / maxC * 100);
                const up = s.contrib >= 0;
                return (
                  <div key={s.ticker} className="row"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 2 }}
                    onClick={() => setSelected(s.ticker)}>
                    <div style={{ width: 48, fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 600, color: C.text }}>{s.ticker}</div>
                    <div style={{ width: 170, fontSize: 11, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "50%", display: "flex", justifyContent: "flex-end" }}>
                        {!up && <div style={{ width: `${barW}%`, height: 7, background: C.dn, borderRadius: "2px 0 0 2px", opacity: 0.65 }} />}
                      </div>
                      <div style={{ width: 1, height: 12, background: C.borderMid }} />
                      <div style={{ width: "50%" }}>
                        {up && <div style={{ width: `${barW}%`, height: 7, background: C.up, borderRadius: "0 2px 2px 0", opacity: 0.65 }} />}
                      </div>
                    </div>
                    <div style={{ width: 64, textAlign: "right", fontFamily: "'Geist Mono', monospace", color: up ? C.up : C.dn, fontWeight: 500, fontSize: 11 }}>
                      {up ? "+" : ""}{s.contrib.toFixed(4)}
                    </div>
                    <div style={{ width: 52, textAlign: "right", fontSize: 10, color: C.textMuted, fontFamily: "'Geist Mono', monospace" }}>{s.indexWeight.toFixed(1)}% wt</div>
                  </div>
                );
              })}
          </div>
          <div style={{ marginTop: 16, padding: "14px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "Index Move",    val: `${parseFloat(indexGain) >= 0 ? "+" : ""}${indexGain} pts`, color: parseFloat(indexGain) >= 0 ? C.up : C.dn },
              { label: "Top Contributor", val: [...VN30_STOCKS].sort((a,b)=>(b.chg*b.indexWeight)-(a.chg*a.indexWeight))[0].ticker, color: C.up },
              { label: "Top Drag",      val: [...VN30_STOCKS].sort((a,b)=>(a.chg*a.indexWeight)-(b.chg*b.indexWeight))[0].ticker, color: C.dn },
              { label: "Adv / Dec",     val: `${advancers} / ${decliners}`, color: C.text },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 500, color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STOCK DETAIL MODAL ──────────────────────────────────────────────── */}
      {sel && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 4, padding: "24px 28px", maxWidth: 500, width: "100%", position: "relative" }}
            onClick={e => e.stopPropagation()}>

            {/* Modal nav */}
            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 6, alignItems: "center" }}>
              <button className="nav-btn" onClick={goPrev}>‹</button>
              <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'Geist Mono', monospace" }}>{selIdx + 1}/{VN30_STOCKS.length}</span>
              <button className="nav-btn" onClick={goNext}>›</button>
              <button className="nav-btn" style={{ marginLeft: 4, fontSize: 12 }} onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 20, fontWeight: 600, color: C.text }}>{sel.ticker}</div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>{sel.name}</div>
                <div style={{ fontSize: 10, color: SECTOR_COLORS[sel.sector], fontWeight: 500, marginTop: 4 }}>{sel.sector}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 20, fontWeight: 600, color: C.text }}>{sel.price.toFixed(1)}</div>
                <div style={{ fontFamily: "'Geist Mono', monospace", color: sel.chg >= 0 ? C.up : C.dn, fontWeight: 500, fontSize: 13, marginTop: 2 }}>
                  {sel.chg >= 0 ? "+" : ""}{sel.chg.toFixed(1)}% today
                </div>
              </div>
            </div>

            {/* 30-day full chart */}
            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>30-Day Price Chart</div>
              <FullChart data={SPARK[sel.ticker]} up={sel.chg >= 0} ticker={sel.ticker} />
            </div>

            {/* 52W range */}
            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>52-Week Range</div>
              <RangeBar price={sel.price} low={sel.wkLow} high={sel.wkHigh} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 5, fontFamily: "'Geist Mono', monospace" }}>
                <span>L {sel.wkLow.toFixed(1)}</span>
                <span style={{ color: C.text, fontWeight: 500 }}>{sel.price.toFixed(1)}</span>
                <span>H {sel.wkHigh.toFixed(1)}</span>
              </div>
              <div style={{ textAlign: "center", fontSize: 10, color: ((sel.price - sel.wkHigh) / sel.wkHigh * 100) >= -5 ? C.up : C.dn, marginTop: 4, fontFamily: "'Geist Mono', monospace" }}>
                {((sel.price - sel.wkHigh) / sel.wkHigh * 100).toFixed(1)}% from 52-week high
              </div>
            </div>

            {/* Valuation multiples + stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "P/E",        val: `${sel.pe.toFixed(1)}x` },
                { label: "P/B",        val: `${sel.pb.toFixed(1)}x` },
                { label: "EV/EBITDA",  val: `${sel.evEbitda.toFixed(1)}x` },
                { label: "Index Wt",   val: `${sel.indexWeight.toFixed(1)}%` },
                { label: "Mkt Cap",    val: `${sel.mktCap.toFixed(0)}T ₫` },
                { label: "Contribution", val: `${(sel.chg * sel.indexWeight / 100) >= 0 ? "+" : ""}${(sel.chg * sel.indexWeight / 100).toFixed(4)} pts` },
              ].map(m => (
                <div key={m.label} style={{ background: C.bg, borderRadius: 3, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 500, color: C.text }}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "10px 24px", borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textMuted, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
        <span>Built by <span style={{ color: C.textSub, fontWeight: 600 }}>Yen Tran</span> · Data layer: mock — designed for live swap via SSI DataHub or Fireant WebSocket</span>
        <span>HOSE · ICT (UTC+7) · Prices in VND thousands</span>
      </div>
    </div>
  );
}