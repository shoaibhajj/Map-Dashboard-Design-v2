import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../shared/ThemeToggle";
import LanguageToggle from "../shared/LanguageToggle";
import type { TranslationKey } from "../i18n/strings";

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, s: number, e: number) {
  const ps = polarToCartesian(cx, cy, r, s);
  const pe = polarToCartesian(cx, cy, r, e);
  const large = (e - s) % 360 > 180 ? 1 : 0;
  return `M ${ps.x.toFixed(2)} ${ps.y.toFixed(
    2
  )} A ${r} ${r} 0 ${large} 1 ${pe.x.toFixed(2)} ${pe.y.toFixed(2)}`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function cubicB(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  );
}

function useAnimatedNumber(target: number, duration = 500) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const t0 = performance.now();
    let raf: number;
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(lerp(start, target, e)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    prev.current = target;
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// ═══════════════════════════════════════════════════════════
// SHARED MAP SVG PRIMITIVES
// ═══════════════════════════════════════════════════════════

interface Pt {
  x: number;
  y: number;
}

interface CityDef {
  id: string;
  name: string;
  x: number;
  y: number;
  v: number;
}

const CITIES: CityDef[] = [
  { id: "JED", name: "Jeddah", x: 115, y: 308, v: 263 },
  { id: "MON", name: "Madinah", x: 224, y: 196, v: 142 },
  { id: "RYD", name: "Riyadh", x: 378, y: 261, v: 318 },
  { id: "DMM", name: "Dammam", x: 537, y: 231, v: 194 },
  { id: "ABH", name: "Abha", x: 165, y: 358, v: 87 },
  { id: "TAB", name: "Tabuk", x: 88, y: 128, v: 54 },
  { id: "HAL", name: "Ha'il", x: 272, y: 138, v: 71 },
];

function MapGridBg({ pid }: { pid: string }) {
  return (
    <>
      <defs>
        <pattern
          id={`g-${pid}`}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#0c2a2c"
            strokeWidth="0.5"
          />
        </pattern>
        <filter id={`gf-${pid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`gs-${pid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="680" height="420" fill="#041319" />
      <rect width="680" height="420" fill={`url(#g-${pid})`} />
      <ellipse
        cx="330"
        cy="260"
        rx="260"
        ry="115"
        fill="#0b2a2b"
        opacity="0.55"
      />
    </>
  );
}

function CityNode({
  city,
  pid,
  active,
  highlight,
  onClick,
  large,
  dimmed,
}: {
  city: CityDef;
  pid: string;
  active?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  large?: boolean;
  dimmed?: boolean;
}) {
  const r = large ? 9 : 6;
  const ri = large ? 4 : 3;
  const c = highlight ? "#00e8b4" : active ? "#00e8b4" : "#0a6b5a";
  const sc = highlight ? "#00e8b4" : active ? "#00e8b4" : "#1b4a4d";
  const opacity = dimmed ? 0.35 : 1;

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", opacity }}
    >
      <g filter={`url(#${large || highlight ? "gs" : "gf"}-${pid})`}>
        <circle
          cx={city.x}
          cy={city.y}
          r={r}
          fill="#041319"
          stroke={sc}
          strokeWidth={large ? 2.5 : 2}
        />
        <circle cx={city.x} cy={city.y} r={ri} fill={c} />
      </g>
      {(active || highlight) && (
        <circle
          cx={city.x}
          cy={city.y}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth="1"
        >
          <animate
            attributeName="r"
            values={`${r};${large ? 24 : 18};${r}`}
            dur="2.8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0;0.6"
            dur="2.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <text
        x={city.x}
        y={city.y - r - 6}
        textAnchor="middle"
        fill={c}
        fontSize={large ? 11 : 10}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="500"
      >
        {city.id}
      </text>
      {active && (
        <text
          x={city.x + r + 4}
          y={city.y + 4}
          fill="#86a3ad"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          {city.v}
        </text>
      )}
    </g>
  );
}

// ═══════════════════════════════════════════════════════════
// HERO MAP — original animated fleet map
// ═══════════════════════════════════════════════════════════

function HeroMap() {
  const pid = "hero";
  const routes = [
    "M 115 308 C 155 255, 188 214, 224 196",
    "M 224 196 C 272 188, 327 236, 378 261",
    "M 378 261 C 434 253, 488 237, 537 231",
  ];
  return (
    <svg
      viewBox="0 0 680 420"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path
          id={`pa-${pid}`}
          d="M 115 308 C 155 255, 188 214, 224 196 C 272 188, 327 236, 378 261"
        />
        <path id={`pb-${pid}`} d="M 378 261 C 434 253, 488 237, 537 231" />
        <path
          id={`pc-${pid}`}
          d="M 537 231 C 488 237, 434 253, 378 261 C 327 236, 272 188, 224 196 C 188 214, 155 255, 115 308"
        />
      </defs>
      <MapGridBg pid={pid} />
      {routes.map((d, i) => (
        <path key={i} d={d} stroke="#0a3a3a" strokeWidth="2.5" fill="none" />
      ))}
      {routes.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="#00e8b4"
          strokeWidth="1.5"
          fill="none"
          filter={`url(#gf-${pid})`}
          opacity="0.9"
          strokeDasharray="6 3"
          style={{ animation: "dash-march 1.5s linear infinite" }}
        />
      ))}
      {CITIES.slice(0, 4).map((c, i) => (
        <CityNode key={c.id} city={c} pid={pid} active large={c.id === "RYD"} />
      ))}
      {/* Vehicle 1 */}
      <g filter={`url(#gs-${pid})`}>
        <circle r="5.5" fill="#00e8b4">
          <animateMotion dur="10s" repeatCount="indefinite">
            <mpath href={`#pa-${pid}`} />
          </animateMotion>
        </circle>
        <circle r="13" fill="none" stroke="#00e8b4" strokeWidth="1">
          <animateMotion dur="10s" repeatCount="indefinite">
            <mpath href={`#pa-${pid}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      {/* Vehicle 2 */}
      <g filter={`url(#gf-${pid})`} opacity="0.85">
        <circle r="4.5" fill="#00e8b4">
          <animateMotion dur="7s" repeatCount="indefinite" begin="4s">
            <mpath href={`#pb-${pid}`} />
          </animateMotion>
        </circle>
      </g>
      {/* Vehicle 3 amber */}
      <g filter={`url(#gf-${pid})`} opacity="0.8">
        <circle r="4" fill="#f59e0b">
          <animateMotion dur="14s" repeatCount="indefinite" begin="7s">
            <mpath href={`#pc-${pid}`} />
          </animateMotion>
        </circle>
        <circle r="9" fill="none" stroke="#f59e0b" strokeWidth="1">
          <animateMotion dur="14s" repeatCount="indefinite" begin="7s">
            <mpath href={`#pc-${pid}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0.4;0;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
      {/* Scan */}
      <rect
        x="0"
        y="0"
        width="680"
        height="2"
        fill="#00e8b4"
        opacity="0.07"
        style={{ animation: "scan 5s linear infinite" }}
      />
      {/* Compass */}
      <g transform="translate(635, 52)">
        <circle r="22" fill="#08181e" stroke="#153139" strokeWidth="1" />
        <text
          y="-8"
          textAnchor="middle"
          fill="#00e8b4"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          N
        </text>
        <text
          y="15"
          textAnchor="middle"
          fill="#86a3ad"
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
        >
          S
        </text>
        <polygon
          points="0,-15 3.5,-3 -3.5,-3"
          fill="#00e8b4"
          filter={`url(#gf-${pid})`}
        />
        <polygon points="0,15 3.5,3 -3.5,3" fill="#153139" />
      </g>
      <circle cx="18" cy="18" r="4" fill="#00e8b4">
        <animate
          attributeName="opacity"
          values="1;0.15;1"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        x="28"
        y="22"
        fill="#00e8b4"
        fontSize="9.5"
        fontFamily="JetBrains Mono, monospace"
      >
        TripMonitor — Live
      </text>
      <text
        x="16"
        y="408"
        fill="#86a3ad"
        fontSize="8.5"
        fontFamily="JetBrains Mono, monospace"
      >
        ● 124 Idle · ● 23 Offline
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// ARC GAUGE
// ═══════════════════════════════════════════════════════════

function ArcGauge({
  value,
  max,
  label,
  color = "#00e8b4",
  warn,
  size = 120,
}: {
  value: number;
  max: number;
  label: string;
  color?: string;
  warn?: number;
  size?: number;
}) {
  const pct = Math.min(value / max, 1);
  const cx = size / 2,
    cy = size / 2,
    r = size * 0.42;
  const fillColor = warn && value >= warn ? "#f59e0b" : color;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      <path
        d={arcPath(cx, cy, r, 150, 390)}
        fill="none"
        stroke="#153139"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {pct > 0.01 && (
        <path
          d={arcPath(cx, cy, r, 150, 150 + 240 * pct)}
          fill="none"
          stroke={fillColor}
          strokeWidth="7"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${fillColor}88)`,
            transition: "all 0.4s ease",
          }}
        />
      )}
      <text
        x={cx}
        y={cy + 7}
        textAnchor="middle"
        fill={fillColor}
        fontSize={size * 0.22}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="500"
        style={{ transition: "all 0.4s ease" }}
      >
        {value}
      </text>
      <text
        x={cx}
        y={cy + size * 0.2}
        textAnchor="middle"
        fill="#86a3ad"
        fontSize={size * 0.085}
        fontFamily="JetBrains Mono, monospace"
      >
        {label}
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks: { key: TranslationKey }[] = [
    { key: "landing_nav_platform" },
    { key: "landing_nav_fleet" },
    { key: "landing_nav_analytics" },
    { key: "landing_nav_enterprise" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ground/95 backdrop-blur-sm border-b border-edge" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-neon flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-ground">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-text tracking-widest">
            TRIPMONITOR
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.key}
              href="#"
              className="font-body text-sm text-muted hover:text-text transition-colors"
            >
              {t(l.key)}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle variant="nav" />
          <ThemeToggle variant="nav" />
          {!isAuthenticated && (
            <Link
              to="/login"
              className="hidden sm:inline font-body text-sm text-muted hover:text-text transition-colors px-2"
            >
              {t("landing_nav_login")}
            </Link>
          )}
          <Link to={isAuthenticated ? "/app" : "/signup"}>
            <button className="font-display font-semibold text-sm tracking-widest px-5 py-2.5 bg-neon text-ground hover:bg-neon-dim transition-colors whitespace-nowrap">
              {isAuthenticated ? t("landing_nav_dashboard") : t("landing_nav_request_demo")}
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════

function Hero() {
  const { t } = useLanguage();
  const [count, setCount] = useState(847);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timerId = setInterval(() => {
      setCount((v) => v + (Math.random() > 0.45 ? 1 : -1));
      setTick((v) => v + 1);
    }, 2800);
    return () => clearInterval(timerId);
  }, []);
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-ground" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 70% 50%, #0a6b5a, transparent)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
        <div
          className="space-y-8"
          style={{ animation: "fade-up 0.8s ease both" }}
        >
          <div className="inline-flex items-center gap-2 border border-edge px-3 py-1.5 font-mono text-xs text-neon">
            <span
              className="w-1.5 h-1.5 rounded-full bg-neon"
              style={{ animation: "blink-dot 1.6s ease infinite" }}
            />
            {t("landing_system_nominal")} · {new Date().toTimeString().slice(0, 5)} UTC+3
          </div>
          <h1
            className="font-display font-extrabold uppercase leading-none text-text"
            style={{
              fontSize: "clamp(3.5rem, 7vw, 6.5rem)",
              letterSpacing: "-0.01em",
            }}
          >
            Every
            <br />
            Vehicle.
            <br />
            <span
              className="text-neon"
              style={{ textShadow: "0 0 40px #00e8b455" }}
            >
              Every
              <br />
              Second.
            </span>
          </h1>
          <p className="font-body text-muted text-lg leading-relaxed max-w-sm">
            Real-time GPS fleet intelligence. Sub-second updates, predictive
            routing, and live anomaly detection at any scale.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={'/signup'}>
            <button className="font-display font-bold tracking-widest text-sm uppercase px-7 py-3.5 bg-neon text-ground hover:bg-neon-dim transition-colors">
              {t("landing_start_trial")}
            </button>
            </Link>
            <a href="#route-planner">
              <button className="font-display font-semibold tracking-widest text-sm uppercase px-7 py-3.5 border border-edge text-text hover:border-neon hover:text-neon transition-colors">
                {t("landing_try_demo")}
              </button>
            </a>
          </div>
          <div className="flex items-center gap-8 pt-2">
            {[
              { value: String(count), labelKey: "landing_stat_vehicles_live" as const },
              { value: "99.8%", labelKey: "landing_stat_uptime_sla" as const },
              { value: "<1s", labelKey: "landing_stat_update_latency" as const },
            ].map(({ value, labelKey }) => (
              <div key={labelKey}>
                <div className="font-mono text-xl text-neon font-medium">
                  {value}
                </div>
                <div className="font-body text-xs text-muted mt-0.5">
                  {t(labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="relative"
          style={{ animation: "fade-up 0.8s 0.2s ease both" }}
        >
          <div
            className="relative border border-edge bg-surface overflow-hidden"
            style={{ boxShadow: "0 0 80px #00e8b418, 0 0 200px #00e8b408" }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-edge bg-ground">
              <div className="flex items-center gap-2 font-mono text-xs text-muted">
                <span
                  className="w-2 h-2 rounded-full bg-neon"
                  style={{ animation: "blink-dot 1.8s ease infinite" }}
                />
                FLEET · LIVE VIEW
              </div>
              <div className="flex items-center gap-3 font-mono text-xs text-muted">
                <span>SAT: 12</span>
                <span className="text-neon">● REC</span>
              </div>
            </div>
            <div className="relative">
              <HeroMap />
              {/* Stat overlays */}
              <div
                className="absolute top-8 right-4 border border-edge bg-ground/90 backdrop-blur-sm px-4 py-3"
                style={{ animation: "pop-in 0.6s 0.5s both" }}
              >
                <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-1">
                  {t("landing_active_vehicles")}
                </div>
                <div
                  className="font-display font-extrabold text-3xl text-text leading-none"
                  key={tick}
                  style={{ animation: "count-tick 0.3s ease" }}
                >
                  {count}
                </div>
                <div className="font-mono text-[10px] text-neon mt-1">
                  ↑ +12 today
                </div>
              </div>
              <div
                className="absolute top-8 left-4 border border-amber/30 bg-ground/90 backdrop-blur-sm px-4 py-3"
                style={{ animation: "pop-in 0.6s 0.7s both" }}
              >
                <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-1">
                  ⚠ Alerts
                </div>
                <div className="font-display font-extrabold text-3xl text-amber leading-none">
                  3
                </div>
              </div>
              <div
                className="absolute bottom-10 left-4 border border-edge bg-ground/90 backdrop-blur-sm px-4 py-3"
                style={{ animation: "pop-in 0.6s 0.9s both" }}
              >
                <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-1">
                  System Uptime
                </div>
                <div
                  className="font-display font-extrabold text-3xl text-neon leading-none"
                  style={{ textShadow: "0 0 20px #00e8b455" }}
                >
                  99.8%
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-neon" />
          <div className="absolute -top-2 -right-2 w-5 h-5 border-t-2 border-r-2 border-neon" />
          <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-2 border-l-2 border-neon" />
          <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-neon" />
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted flex flex-col items-center gap-2">
        <span>{t("landing_explore_below")}</span>
        <div className="w-px h-10 bg-gradient-to-b from-muted to-transparent" />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// METRICS TICKER
// ═══════════════════════════════════════════════════════════

const TICKS: { labelKey: TranslationKey; value: string }[] = [
  { labelKey: "landing_ticker_active_vehicles", value: "847" },
  { labelKey: "landing_ticker_routes_today", value: "12,390" },
  { labelKey: "landing_ticker_km_tracked", value: "4.2M" },
  { labelKey: "landing_ticker_avg_speed", value: "68 km/h" },
  { labelKey: "landing_ticker_fuel_saved", value: "18.4%" },
  { labelKey: "landing_ticker_on_time_rate", value: "97.3%" },
  { labelKey: "landing_ticker_alerts_resolved", value: "1,241" },
  { labelKey: "landing_ticker_uptime", value: "99.8%" },
];

function MetricsTicker() {
  const { t } = useLanguage();
  const doubled = [...TICKS, ...TICKS];
  return (
    <div className="border-y border-neon/20 bg-surface2 overflow-hidden py-3 relative">
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10"
        style={{
          background: "linear-gradient(to right, var(--color-surface2), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10"
        style={{ background: "linear-gradient(to left, var(--color-surface2), transparent)" }}
      />
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "ticker 32s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-8">
            <span className="font-mono text-xs text-muted uppercase tracking-wider">
              {t(item.labelKey)}
            </span>
            <span className="font-display font-bold text-neon text-base tracking-wide">
              {item.value}
            </span>
            <span className="font-mono text-edge ml-6">—</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INTERACTIVE 1 — ROUTE BUILDER
// ═══════════════════════════════════════════════════════════

function buildCurvedPath(pts: CityDef[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1],
      b = pts[i];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.12;
    d += ` Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x} ${b.y}`;
  }
  return d;
}

const ROUTE_STATS = (cities: CityDef[]) => ({
  distance: Math.round(cities.length * 187 + Math.random() * 60),
  duration: cities.length * 112 + 34,
  fuel: Math.round(cities.length * 28.4 * 10) / 10,
  saved: Math.round(cities.length * 18 + 12),
});

function RouteBuilderSection() {
  const [selected, setSelected] = useState<CityDef[]>([]);
  const [phase, setPhase] = useState<"idle" | "optimizing" | "done">("idle");
  const [dashOff, setDashOff] = useState(3000);
  const [stats, setStats] = useState<ReturnType<typeof ROUTE_STATS> | null>(
    null
  );

  const toggleCity = (city: CityDef) => {
    if (phase !== "idle") return;
    setSelected((prev) =>
      prev.find((c) => c.id === city.id)
        ? prev.filter((c) => c.id !== city.id)
        : prev.length < 5
        ? [...prev, city]
        : prev
    );
  };

  const optimize = async () => {
    if (selected.length < 2 || phase !== "idle") return;
    setPhase("optimizing");
    setDashOff(3000);
    await new Promise((r) => setTimeout(r, 600));
    setDashOff(0);
    await new Promise((r) => setTimeout(r, 1600));
    setStats(ROUTE_STATS(selected));
    setPhase("done");
  };

  const reset = () => {
    setSelected([]);
    setPhase("idle");
    setDashOff(3000);
    setStats(null);
  };

  const routePath = buildCurvedPath(selected);
  const pid = "rb";
  const { t } = useLanguage();

  return (
    <section id="route-planner" className="bg-ground border-t border-edge">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <div className="font-mono text-xs text-neon tracking-[0.2em] uppercase mb-3">
            Interactive · {t("landing_route_planner")}
          </div>
          <h2
            className="font-display font-extrabold uppercase text-text leading-none mb-4"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Build Your First
            <br />
            <span className="text-neon">Optimized Route</span>
          </h2>
          <p className="font-body text-muted text-base max-w-lg">
            Select up to 5 cities. Hit optimize and watch our engine calculate
            the most efficient multi-stop route in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Map */}
          <div
            className="relative border border-edge bg-surface overflow-hidden"
            style={{
              boxShadow: phase === "done" ? "0 0 60px #00e8b418" : "none",
              transition: "box-shadow 1s",
            }}
          >
            <div className="px-4 py-2.5 border-b border-edge bg-ground flex items-center justify-between">
              <span className="font-mono text-xs text-muted">
                {selected.length === 0
                  ? "SELECT CITIES ON MAP OR BELOW"
                  : selected.length === 1
                  ? "1 CITY SELECTED — ADD MORE"
                  : `${selected.length} CITIES SELECTED`}
              </span>
              {selected.length > 0 && (
                <span className="font-mono text-xs text-neon">
                  {selected.map((c) => c.id).join(" → ")}
                </span>
              )}
            </div>
            <svg
              viewBox="0 0 680 420"
              className="w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <MapGridBg pid={pid} />
              {/* Optimized route */}
              {selected.length >= 2 && (
                <>
                  <path
                    d={routePath}
                    stroke="#0a3a3a"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d={routePath}
                    stroke="#00e8b4"
                    strokeWidth="2"
                    fill="none"
                    filter={`url(#gf-${pid})`}
                    strokeDasharray="3000"
                    strokeDashoffset={dashOff}
                    style={{ transition: "stroke-dashoffset 1.5s ease" }}
                  />
                </>
              )}
              {/* City nodes */}
              {CITIES.map((c) => (
                <CityNode
                  key={c.id}
                  city={c}
                  pid={pid}
                  active={!!selected.find((s) => s.id === c.id)}
                  highlight={
                    phase === "done" && !!selected.find((s) => s.id === c.id)
                  }
                  dimmed={
                    selected.length > 0 && !selected.find((s) => s.id === c.id)
                  }
                  onClick={() => toggleCity(c)}
                  large={c.id === "RYD"}
                />
              ))}
              {/* Moving vehicle on completed route */}
              {phase === "done" && selected.length >= 2 && (
                <g filter={`url(#gs-${pid})`}>
                  <circle r="6" fill="#00e8b4">
                    <animateMotion
                      dur="6s"
                      repeatCount="indefinite"
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#rb-route-path" />
                    </animateMotion>
                  </circle>
                </g>
              )}
              {phase === "done" && (
                <path id="rb-route-path" d={routePath} fill="none" />
              )}
              {/* Optimizing animation */}
              {phase === "optimizing" && (
                <g>
                  {selected.map((c, i) => (
                    <circle
                      key={c.id}
                      cx={c.x}
                      cy={c.y}
                      r="25"
                      fill="none"
                      stroke="#00e8b4"
                      strokeWidth="1"
                      opacity="0"
                    >
                      <animate
                        attributeName="opacity"
                        values="0;0.6;0"
                        dur="0.8s"
                        begin={`${i * 0.1}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="r"
                        values="6;28;6"
                        dur="0.8s"
                        begin={`${i * 0.1}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                  <text
                    x="340"
                    y="210"
                    textAnchor="middle"
                    fill="#00e8b4"
                    fontSize="12"
                    fontFamily="JetBrains Mono, monospace"
                    style={{ animation: "blink-dot 0.8s ease infinite" }}
                  >
                    OPTIMIZING…
                  </text>
                </g>
              )}
            </svg>
            {phase !== "done" && (
              <div className="absolute bottom-3 left-3 font-mono text-[10px] text-muted">
                {phase === "idle" ? "CLICK CITIES TO SELECT" : ""}
              </div>
            )}
          </div>

          {/* Control panel */}
          <div className="space-y-4">
            {/* City chips */}
            <div className="border border-edge bg-surface p-4">
              <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">
                Select Cities
              </div>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((c) => {
                  const on = !!selected.find((s) => s.id === c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCity(c)}
                      disabled={phase !== "idle"}
                      className={`px-3 py-1.5 font-mono text-xs transition-all border ${
                        on
                          ? "border-neon bg-neon/10 text-neon"
                          : "border-edge text-muted hover:border-neon/50 hover:text-text"
                      } ${
                        phase !== "idle"
                          ? "opacity-40 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {c.id} <span className="opacity-60">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Route sequence */}
            <div className="border border-edge bg-surface p-4">
              <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">
                Route Sequence
              </div>
              {selected.length === 0 ? (
                <div className="font-mono text-xs text-muted/50 italic">
                  No cities selected
                </div>
              ) : (
                <div className="space-y-1">
                  {selected.map((c, i) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 font-mono text-xs"
                    >
                      <span className="text-muted w-4">{i + 1}.</span>
                      <span className="text-neon">{c.id}</span>
                      <span className="text-muted">{c.name}</span>
                      {i < selected.length - 1 && (
                        <span className="text-edge ml-auto">↓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={phase === "done" ? reset : optimize}
              disabled={selected.length < 2 && phase === "idle"}
              className={`w-full py-4 font-display font-bold tracking-widest text-sm uppercase transition-all ${
                phase === "done"
                  ? "bg-surface border border-neon text-neon hover:bg-neon/10"
                  : selected.length >= 2
                  ? "bg-neon text-ground hover:bg-neon-dim"
                  : "bg-edge/30 text-muted/50 cursor-not-allowed"
              }`}
              style={
                selected.length >= 2 && phase === "idle"
                  ? { boxShadow: "0 0 30px #00e8b422" }
                  : {}
              }
            >
              {phase === "optimizing"
                ? "⟳ CALCULATING…"
                : phase === "done"
                ? "← RESET & REDRAW"
                : "OPTIMIZE ROUTE →"}
            </button>

            {/* Stats */}
            {phase === "done" && stats && (
              <div
                className="border border-neon/30 bg-neon/5 p-4 space-y-3"
                style={{ animation: "fade-up 0.5s ease both" }}
              >
                <div className="font-mono text-[10px] text-neon uppercase tracking-wider">
                  Optimization Result
                </div>
                {[
                  { label: "Total Distance", value: `${stats.distance} km` },
                  {
                    label: "Est. Duration",
                    value: `${Math.floor(stats.duration / 60)}h ${
                      stats.duration % 60
                    }m`,
                  },
                  { label: "Fuel Required", value: `${stats.fuel} L` },
                  {
                    label: "Time Saved vs. Manual",
                    value: `${stats.saved} min`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="font-body text-xs text-muted">
                      {label}
                    </span>
                    <span className="font-mono text-xs text-neon">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// INTERACTIVE 2 — LIVE COCKPIT
// ═══════════════════════════════════════════════════════════

const COCKPIT_ROUTE = {
  p0x: 115,
  p0y: 308,
  p1x: 200,
  p1y: 220,
  p2x: 310,
  p2y: 205,
  p3x: 378,
  p3y: 261,
};

function LiveCockpitSection() {
  const [t, setT] = useState(0);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [flagged, setFlagged] = useState(false);

  const speed = useRef(0);

  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => {
      setT((prev) => (prev + 0.003) % 1);
    }, 50);
    return () => clearInterval(id);
  }, [locked]);

  const vx = cubicB(
    t,
    COCKPIT_ROUTE.p0x,
    COCKPIT_ROUTE.p1x,
    COCKPIT_ROUTE.p2x,
    COCKPIT_ROUTE.p3x
  );
  const vy = cubicB(
    t,
    COCKPIT_ROUTE.p0y,
    COCKPIT_ROUTE.p1y,
    COCKPIT_ROUTE.p2y,
    COCKPIT_ROUTE.p3y
  );

  // Speed profile: ramp up mid-route, slow at ends
  const rawSpeed = locked
    ? 0
    : Math.round(
        t < 0.15
          ? lerp(38, 78, t / 0.15)
          : t < 0.5
          ? lerp(78, 112, (t - 0.15) / 0.35)
          : t < 0.85
          ? lerp(112, 95, (t - 0.5) / 0.35)
          : lerp(95, 48, (t - 0.85) / 0.15)
      );
  speed.current = rawSpeed;

  const fuel = Math.round(82 - t * 7);
  const eng = Math.round(lerp(72, 91, Math.sin(t * Math.PI) * 0.5 + 0.5));
  const lat = lerp(21.4858, 24.7136, t).toFixed(4);
  const lon = lerp(39.1925, 46.6753, t).toFixed(4);
  const head = Math.round(lerp(42, 72, t));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const pid = "ck";

  return (
    <section className="bg-surface2 border-t border-edge">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <div className="font-mono text-xs text-neon tracking-[0.2em] uppercase mb-3">
            Interactive · Vehicle Cockpit
          </div>
          <h2
            className="font-display font-extrabold uppercase text-text leading-none mb-4"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Inside a<br />
            <span className="text-neon">Live Tracked Vehicle</span>
          </h2>
          <p className="font-body text-muted text-base max-w-lg">
            This is what your operations team sees in real time. Every metric.
            Every action. All from one screen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Map with moving vehicle */}
          <div className="relative border border-edge bg-surface overflow-hidden">
            <div className="px-4 py-2.5 border-b border-edge bg-ground flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-muted">
                <span
                  className={`w-2 h-2 rounded-full ${
                    locked ? "bg-amber" : "bg-neon"
                  }`}
                  style={{ animation: "blink-dot 1.5s ease infinite" }}
                />
                TRK-447 · {locked ? "LOCKED" : "EN ROUTE JED→RYD"}
              </div>
              <span
                className={`font-mono text-xs ${
                  flagged ? "text-red" : "text-muted"
                }`}
              >
                {flagged ? "⚑ FLAGGED" : `HDG ${head}°`}
              </span>
            </div>
            <svg
              viewBox="0 0 680 420"
              className="w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <MapGridBg pid={pid} />
              {/* Route path */}
              <path
                d="M 115 308 C 200 220, 310 205, 378 261"
                stroke="#0a3a3a"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 115 308 C 200 220, 310 205, 378 261"
                stroke="#00e8b4"
                strokeWidth="1.5"
                fill="none"
                filter={`url(#gf-${pid})`}
                opacity="0.9"
                strokeDasharray="6 3"
                style={{ animation: "dash-march 1.5s linear infinite" }}
              />
              {/* Traversed portion */}
              <path
                d={`M 115 308 C 200 220, 310 205, 378 261`}
                stroke="#00e8b4"
                strokeWidth="3"
                fill="none"
                filter={`url(#gf-${pid})`}
                opacity="0.3"
                strokeDasharray="3000"
                strokeDashoffset={3000 - t * 3000}
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
              {/* Endpoints */}
              <CityNode city={CITIES[0]} pid={pid} active />
              <CityNode city={CITIES[2]} pid={pid} active large />
              {/* Vehicle */}
              <g filter={`url(#gs-${pid})`}>
                <circle
                  cx={vx}
                  cy={vy}
                  r="8"
                  fill="#041319"
                  stroke="#00e8b4"
                  strokeWidth="2.5"
                />
                <circle cx={vx} cy={vy} r="3" fill="#00e8b4" />
                {!locked && (
                  <circle
                    cx={vx}
                    cy={vy}
                    r="8"
                    fill="none"
                    stroke="#00e8b4"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="r"
                      values="8;20;8"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
              {/* Vehicle label */}
              <rect
                x={vx + 10}
                y={vy - 18}
                width="62"
                height="18"
                fill="#08181e"
                stroke="#153139"
                strokeWidth="1"
                rx="1"
              />
              <text
                x={vx + 41}
                y={vy - 6}
                textAnchor="middle"
                fill="#00e8b4"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                TRK-447
              </text>
              {/* Speed badge */}
              <rect
                x={vx + 10}
                y={vy + 6}
                width="48"
                height="16"
                fill="#08181e"
                stroke="#153139"
                strokeWidth="1"
                rx="1"
              />
              <text
                x={vx + 34}
                y={vy + 17}
                textAnchor="middle"
                fill={rawSpeed > 100 ? "#f59e0b" : "#00e8b4"}
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {rawSpeed} km/h
              </text>
            </svg>
          </div>

          {/* Telemetry panel */}
          <div className="space-y-4">
            {/* Gauges */}
            <div className="border border-edge bg-surface p-4">
              <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-4">
                Live Telemetry
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="w-full aspect-square">
                  <ArcGauge
                    value={rawSpeed}
                    max={140}
                    label="km/h"
                    warn={110}
                  />
                </div>
                <div className="w-full aspect-square">
                  <ArcGauge
                    value={fuel}
                    max={100}
                    label="fuel %"
                    color={fuel < 20 ? "#ef4444" : "#00e8b4"}
                  />
                </div>
                <div className="w-full aspect-square">
                  <ArcGauge
                    value={eng}
                    max={120}
                    label="°C engine"
                    color="#f59e0b"
                    warn={105}
                  />
                </div>
              </div>
            </div>

            {/* Position data */}
            <div className="border border-edge bg-surface p-4 font-mono text-xs space-y-2">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-3">
                Position Data
              </div>
              {[
                { k: "LAT", v: `${lat}° N` },
                { k: "LON", v: `${lon}° E` },
                { k: "HEADING", v: `${head}° NE` },
                { k: "DRIVER", v: "Ahmed Al-Rashid" },
                { k: "VEHICLE", v: "Volvo FH16 · TRK-447" },
              ].map(({ k, v }) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-edge/40 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-muted">{k}</span>
                  <span className="text-text">{v}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="border border-edge bg-surface p-4">
              <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">
                Actions
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => showToast("📢 Alert sent to Ahmed Al-Rashid")}
                  className="py-2.5 font-mono text-xs text-amber border border-amber/40 hover:bg-amber/10 transition-colors"
                >
                  ⚠ Send Alert
                </button>
                <button
                  onClick={() => {
                    setLocked((l) => !l);
                    showToast(
                      locked ? "Vehicle resumed" : "🔒 Remote lock engaged"
                    );
                  }}
                  className={`py-2.5 font-mono text-xs border transition-colors ${
                    locked
                      ? "border-neon text-neon hover:bg-neon/10"
                      : "border-red/40 text-red hover:bg-red/10"
                  }`}
                >
                  {locked ? "▶ Resume" : "⏸ Lock Vehicle"}
                </button>
                <button
                  onClick={() => {
                    setFlagged((f) => !f);
                    showToast(
                      flagged ? "Flag removed" : "⚑ Vehicle flagged for review"
                    );
                  }}
                  className={`py-2.5 font-mono text-xs border transition-colors ${
                    flagged
                      ? "border-red text-red hover:bg-red/10"
                      : "border-edge text-muted hover:border-neon/50 hover:text-text"
                  }`}
                >
                  {flagged ? "✗ Unflag" : "⚑ Flag for Review"}
                </button>
                <button
                  onClick={() => {
                    setT(0);
                    showToast("🔄 Route replay started");
                  }}
                  className="py-2.5 font-mono text-xs text-muted border border-edge hover:border-neon/50 hover:text-text transition-colors"
                >
                  ↺ Replay Route
                </button>
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div
                className="border border-neon/40 bg-neon/5 px-4 py-3 font-mono text-xs text-neon"
                style={{ animation: "slide-alert 0.3s ease" }}
              >
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// INTERACTIVE 3 — GEOFENCE PAINTER
// ═══════════════════════════════════════════════════════════

function GeofenceSection() {
  const [points, setPoints] = useState<Pt[]>([]);
  const [activated, setActivated] = useState(false);
  const [alerts, setAlerts] = useState<
    { id: string; msg: string; type: string }[]
  >([]);
  const [vehicleT, setVehicleT] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const centroid: Pt =
    points.length > 0
      ? {
          x: points.reduce((a, p) => a + p.x, 0) / points.length,
          y: points.reduce((a, p) => a + p.y, 0) / points.length,
        }
      : { x: 340, y: 260 };

  const vehicleStart: Pt = {
    x: Math.min(centroid.x + 140, 650),
    y: centroid.y + 20,
  };
  const vx = lerp(vehicleStart.x, centroid.x, vehicleT);
  const vy = lerp(vehicleStart.y, centroid.y, vehicleT);

  useEffect(() => {
    if (!activated) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 3000, 1);
      setVehicleT(p);
      if (p >= 0.75 && alerts.length === 0) {
        setAlerts([
          { id: "TRK-184", msg: "Entered restricted zone", type: "entry" },
        ]);
      }
      if (p >= 0.9 && alerts.length < 2) {
        setAlerts((a) => [
          ...a,
          { id: "TRK-291", msg: "Approaching zone boundary", type: "warn" },
        ]);
      }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [activated]);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (activated) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setPoints((prev) => [
        ...prev.slice(-9),
        {
          x: Math.round(((e.clientX - rect.left) / rect.width) * 680),
          y: Math.round(((e.clientY - rect.top) / rect.height) * 420),
        },
      ]);
    },
    [activated]
  );

  const reset = () => {
    setPoints([]);
    setActivated(false);
    setAlerts([]);
    setVehicleT(0);
  };

  const polyStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  const pid = "gf";
  const ready = points.length >= 3 && !activated;

  return (
    <section className="bg-ground border-t border-edge">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <div className="font-mono text-xs text-neon tracking-[0.2em] uppercase mb-3">
            Interactive · Geofence Builder
          </div>
          <h2
            className="font-display font-extrabold uppercase text-text leading-none mb-4"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Draw Your Own
            <br />
            <span className="text-neon">Geofence Zone</span>
          </h2>
          <p className="font-body text-muted text-base max-w-lg">
            Click anywhere on the map to place fence points. Close your polygon,
            activate the zone, and watch vehicles trigger live alerts as they
            enter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Map */}
          <div
            className="relative border border-edge bg-surface overflow-hidden"
            style={{
              boxShadow: activated ? "0 0 60px #00e8b414" : "none",
              transition: "box-shadow 1s",
            }}
          >
            <div className="px-4 py-2.5 border-b border-edge bg-ground flex items-center justify-between">
              <span className="font-mono text-xs text-muted">
                {!activated
                  ? points.length === 0
                    ? "CLICK THE MAP TO PLACE FENCE POINTS"
                    : points.length < 3
                    ? `${points.length} POINTS — NEED ${3 - points.length} MORE`
                    : `${points.length} POINTS — READY TO ACTIVATE`
                  : "⚡ GEOFENCE ACTIVE"}
              </span>
              {activated && (
                <span
                  className="font-mono text-xs text-neon"
                  style={{ animation: "blink-dot 1.5s ease infinite" }}
                >
                  MONITORING
                </span>
              )}
            </div>
            <svg
              ref={svgRef}
              viewBox="0 0 680 420"
              className="w-full"
              onClick={handleClick}
              style={{ cursor: activated ? "default" : "crosshair" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <MapGridBg pid={pid} />

              {/* Background cities (dimmed) */}
              {CITIES.slice(0, 4).map((c) => (
                <CityNode key={c.id} city={c} pid={pid} dimmed />
              ))}

              {/* Fence preview polyline */}
              {points.length >= 2 && !activated && (
                <polyline
                  points={polyStr}
                  fill="none"
                  stroke="#00e8b4"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  opacity="0.7"
                  filter={`url(#gf-${pid})`}
                />
              )}
              {/* Closing line */}
              {points.length >= 3 && !activated && (
                <line
                  x1={points[points.length - 1].x}
                  y1={points[points.length - 1].y}
                  x2={points[0].x}
                  y2={points[0].y}
                  stroke="#00e8b4"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  opacity="0.4"
                />
              )}

              {/* Activated zone */}
              {activated && points.length >= 3 && (
                <>
                  <polygon
                    points={polyStr}
                    fill="#00e8b4"
                    fillOpacity="0.08"
                    stroke="#00e8b4"
                    strokeWidth="2"
                    filter={`url(#gf-${pid})`}
                    opacity="0.9"
                  />
                  <polygon
                    points={polyStr}
                    fill="none"
                    stroke="#00e8b4"
                    strokeWidth="1"
                    style={{ animation: "zone-pulse 2.5s ease infinite" }}
                    opacity="0.2"
                  />
                </>
              )}

              {/* Fence points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#00e8b4"
                    filter={`url(#gf-${pid})`}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#041319"
                    stroke="#00e8b4"
                    strokeWidth="2"
                  />
                  <text
                    x={p.x + 8}
                    y={p.y + 4}
                    fill="#86a3ad"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {i + 1}
                  </text>
                </g>
              ))}

              {/* Moving vehicle */}
              {activated && (
                <g filter={`url(#gs-${pid})`}>
                  <circle
                    cx={vx}
                    cy={vy}
                    r="6"
                    fill="#041319"
                    stroke="#00e8b4"
                    strokeWidth="2.5"
                  />
                  <circle cx={vx} cy={vy} r="2.5" fill="#00e8b4" />
                  {vehicleT < 0.75 && (
                    <circle
                      cx={vx}
                      cy={vy}
                      r="6"
                      fill="none"
                      stroke="#00e8b4"
                      strokeWidth="1"
                    >
                      <animate
                        attributeName="r"
                        values="6;18;6"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0;0.6"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  {vehicleT >= 0.75 && (
                    <circle
                      cx={vx}
                      cy={vy}
                      r="6"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    >
                      <animate
                        attributeName="r"
                        values="6;20;6"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0;0.8"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <rect
                    x={vx + 10}
                    y={vy - 18}
                    width="62"
                    height="16"
                    fill="#08181e"
                    stroke="#153139"
                    rx="1"
                  />
                  <text
                    x={vx + 41}
                    y={vy - 7}
                    textAnchor="middle"
                    fill="#00e8b4"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    TRK-184
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Panel */}
          <div className="space-y-4">
            {/* Zone config */}
            <div className="border border-edge bg-surface p-4 space-y-3">
              <div className="font-mono text-[10px] text-muted uppercase tracking-wider">
                Zone Settings
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted block mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  defaultValue="Restricted Zone Alpha"
                  className="w-full bg-ground border border-edge px-3 py-2 font-mono text-xs text-text focus:outline-none focus:border-neon transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted block mb-1">
                  Trigger
                </label>
                <div className="flex gap-2">
                  {["Entry", "Exit", "Both"].map((opt) => (
                    <button
                      key={opt}
                      className={`flex-1 py-1.5 font-mono text-xs border transition-colors ${
                        opt === "Entry"
                          ? "border-neon text-neon bg-neon/10"
                          : "border-edge text-muted hover:border-neon/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted block mb-1">
                  Alert Via
                </label>
                <div className="flex gap-2">
                  {["SMS", "Email", "Webhook"].map((opt) => (
                    <button
                      key={opt}
                      className={`flex-1 py-1.5 font-mono text-xs border transition-colors ${
                        opt !== "Webhook"
                          ? "border-neon text-neon bg-neon/10"
                          : "border-edge text-muted hover:border-neon/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="font-mono text-[10px] text-muted pt-1">
                Points placed:{" "}
                <span className="text-neon">{points.length}</span>
                {points.length >= 3 && (
                  <span className="text-neon ml-2">✓ Valid polygon</span>
                )}
              </div>
            </div>

            {/* Activate / reset */}
            <div className="flex gap-2">
              <button
                onClick={ready ? () => setActivated(true) : undefined}
                disabled={!ready}
                className={`flex-1 py-3.5 font-display font-bold tracking-widest text-sm uppercase transition-all ${
                  ready
                    ? "bg-neon text-ground hover:bg-neon-dim"
                    : "bg-edge/30 text-muted/50 cursor-not-allowed"
                }`}
                style={ready ? { boxShadow: "0 0 24px #00e8b422" } : {}}
              >
                {activated ? "⚡ ACTIVE" : "ACTIVATE ZONE"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-3.5 font-mono text-xs text-muted border border-edge hover:border-neon/50 hover:text-text transition-colors"
              >
                CLEAR
              </button>
            </div>

            {/* Alert feed */}
            <div className="border border-edge bg-surface overflow-hidden">
              <div className="px-4 py-2.5 border-b border-edge font-mono text-[10px] text-muted uppercase tracking-wider flex items-center justify-between">
                Alert Feed
                {alerts.length > 0 && (
                  <span className="text-neon font-mono text-[10px]">
                    {alerts.length} ACTIVE
                  </span>
                )}
              </div>
              <div className="divide-y divide-edge min-h-[80px]">
                {alerts.length === 0 ? (
                  <div className="px-4 py-6 font-mono text-xs text-muted/40 text-center">
                    {activated ? "Monitoring…" : "Activate zone to see alerts"}
                  </div>
                ) : (
                  alerts.map((a, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-start gap-3"
                      style={{
                        animation: "slide-alert 0.3s ease both",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          a.type === "entry" ? "bg-red" : "bg-amber"
                        }`}
                        style={{ animation: "blink-dot 1s ease infinite" }}
                      />
                      <div>
                        <div className="font-mono text-xs text-neon">
                          {a.id}
                        </div>
                        <div className="font-body text-xs text-muted">
                          {a.msg}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-muted ml-auto">
                        NOW
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// INTERACTIVE 4 — ROI CALCULATOR
// ═══════════════════════════════════════════════════════════

type Industry = "Logistics" | "Construction" | "Retail" | "Government";
const INDUSTRY_MULT: Record<
  Industry,
  { fuel: number; time: number; co2: number }
> = {
  Logistics: { fuel: 1.0, time: 1.0, co2: 1.0 },
  Construction: { fuel: 1.22, time: 0.85, co2: 1.18 },
  Retail: { fuel: 0.92, time: 1.18, co2: 0.95 },
  Government: { fuel: 0.8, time: 0.9, co2: 0.82 },
};

function ROICalculatorSection() {
  const [fleet, setFleet] = useState(50);
  const [industry, setIndustry] = useState<Industry>("Logistics");

  const m = INDUSTRY_MULT[industry];
  const fuelSav = Math.round(fleet * 280 * m.fuel);
  const hrsSaved = Math.round(fleet * 8.4 * m.time);
  const co2Kg = Math.round(fleet * 420 * m.co2);
  const annualROI = Math.round(fleet * 280 * 12 * 3.8 * m.fuel);

  const dFuel = useAnimatedNumber(fuelSav);
  const dHrs = useAnimatedNumber(hrsSaved);
  const dCo2 = useAnimatedNumber(co2Kg);
  const dROI = useAnimatedNumber(annualROI);

  const barPct = Math.min(fleet / 500, 1);
  const { t } = useLanguage();

  return (
    <section className="bg-surface2 border-t border-edge">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <div className="font-mono text-xs text-neon tracking-[0.2em] uppercase mb-3">
            Interactive · {t("landing_roi_calculator")}
          </div>
          <h2
            className="font-display font-extrabold uppercase text-text leading-none mb-4"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            What Would You
            <br />
            <span className="text-neon">Save This Month?</span>
          </h2>
          <p className="font-body text-muted text-base max-w-lg">
            Move the slider. Watch your savings update in real time. Based on
            anonymized data from 2,400+ fleets worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-center">
          {/* Controls */}
          <div className="space-y-8">
            {/* Fleet size */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <div className="font-mono text-[10px] text-muted uppercase tracking-wider">
                  Fleet Size
                </div>
                <div
                  className="font-display font-extrabold text-neon leading-none"
                  style={{
                    fontSize: "3.5rem",
                    textShadow: "0 0 30px #00e8b433",
                  }}
                >
                  {fleet}
                  <span className="font-display text-xl text-muted ml-2 font-normal">
                    vehicles
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={fleet}
                onChange={(e) => setFleet(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between font-mono text-[10px] text-muted mt-1">
                <span>1</span>
                <span>500</span>
              </div>
            </div>

            {/* Industry */}
            <div>
              <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">
                Industry Vertical
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(INDUSTRY_MULT) as Industry[]).map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`py-3 font-mono text-xs border transition-all ${
                      industry === ind
                        ? "border-neon bg-neon/10 text-neon"
                        : "border-edge text-muted hover:border-neon/40 hover:text-text"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet vs average bar */}
            <div>
              <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">
                Your Fleet vs. Industry Average
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
                    <span>Your Fleet</span>
                    <span>{fleet}v</span>
                  </div>
                  <div className="h-2 bg-edge rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon rounded-full transition-all duration-500"
                      style={{
                        width: `${barPct * 100}%`,
                        boxShadow: "0 0 8px #00e8b466",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-muted mb-1">
                    <span>Avg {industry} Fleet</span>
                    <span>38v</span>
                  </div>
                  <div className="h-2 bg-edge rounded-full overflow-hidden">
                    <div
                      className="h-full bg-leaf/60 rounded-full"
                      style={{ width: "7.6%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Monthly Fuel Savings",
                value: `$${dFuel.toLocaleString()}`,
                sub: `≈ $${Math.round(
                  dFuel / fleet
                ).toLocaleString()} per vehicle`,
                icon: "⛽",
                color: "#00e8b4",
              },
              {
                label: "Hours Recovered",
                value: `${dHrs.toLocaleString()} hrs`,
                sub: `≈ ${(dHrs / fleet).toFixed(1)} hrs per vehicle`,
                icon: "⏱",
                color: "#00e8b4",
              },
              {
                label: "CO₂ Reduced",
                value: `${dCo2.toLocaleString()} kg`,
                sub: `≈ ${(dCo2 / 1000).toFixed(1)} tons this month`,
                icon: "🌿",
                color: "#00b58c",
              },
              {
                label: "Annual ROI",
                value: `$${dROI.toLocaleString()}`,
                sub: `~3.8× on TripMonitor cost`,
                icon: "📈",
                color: "#00e8b4",
                highlight: true,
              },
            ].map(({ label, value, sub, icon, color, highlight }) => (
              <div
                key={label}
                className={`border p-6 transition-all ${
                  highlight
                    ? "border-neon/50 bg-neon/5"
                    : "border-edge bg-surface"
                }`}
                style={highlight ? { boxShadow: "0 0 30px #00e8b410" } : {}}
              >
                <div className="text-2xl mb-3">{icon}</div>
                <div
                  className="font-display font-extrabold leading-none mb-2"
                  style={{
                    fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                    color,
                    textShadow: `0 0 20px ${color}33`,
                  }}
                >
                  {value}
                </div>
                <div className="font-display font-semibold text-text text-sm uppercase tracking-wide mb-1">
                  {label}
                </div>
                <div className="font-body text-xs text-muted">{sub}</div>
              </div>
            ))}

            <div className="sm:col-span-2 border border-edge bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] text-muted uppercase tracking-wider mb-0.5">
                  Payback Period
                </div>
                <div className="font-display font-bold text-neon text-xl">
                  {Math.max(1, Math.round(12 / 3.8))} months
                  <span className="font-body text-sm text-muted ml-2 font-normal">
                    to full ROI
                  </span>
                </div>
              </div>
              <button
                className="font-display font-bold tracking-widest text-sm uppercase px-8 py-3.5 bg-neon text-ground hover:bg-neon-dim transition-colors"
                style={{ boxShadow: "0 0 24px #00e8b422" }}
              >
                Get Your Full Report →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// CTA
// ═══════════════════════════════════════════════════════════

function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="bg-ground border-t border-edge">
      <div className="max-w-5xl mx-auto px-6 py-32 text-center space-y-8">
        <div className="font-mono text-xs text-neon tracking-[0.2em] uppercase">
          No blind spots
        </div>
        <h2
          className="font-display font-extrabold uppercase text-text leading-none"
          style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
        >
          Start Monitoring
          <br />
          Your Fleet in
          <br />
          <span
            className="text-neon"
            style={{ textShadow: "0 0 60px #00e8b440" }}
          >
            10 Minutes.
          </span>
        </h2>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to={"/signup"}>
            <button
              className="font-display font-bold tracking-widest text-base uppercase px-10 py-4 bg-neon text-ground hover:bg-neon-dim transition-colors"
              style={{ boxShadow: "0 0 40px #00e8b430" }}
            >
              {t("landing_start_trial")}
            </button>
          </Link>
          <button className="font-display font-semibold tracking-widest text-base uppercase px-10 py-4 border border-edge text-text hover:border-neon hover:text-neon transition-colors">
            Book a Demo
          </button>
        </div>
        <p className="font-mono text-xs text-muted">
          No credit card · 14-day trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-edge bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-neon flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-ground">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="font-display font-bold tracking-widest text-text text-sm">
                TRIPMONITOR
              </span>
            </div>
            <p className="font-body text-xs text-muted leading-relaxed">
              {t("footer_tagline")}
            </p>
          </div>
          {[
            {
              headingKey: "footer_product" as const,
              links: ["Platform", "Pricing", "API", "Status"],
            },
            {
              headingKey: "footer_company" as const,
              links: ["About", "Careers", "Blog", "Contact"],
            },
            {
              headingKey: "footer_legal" as const,
              links: ["Privacy", "Terms", "Security", "Cookies"],
            },
          ].map((col) => (
            <div key={col.headingKey}>
              <div className="font-mono text-[10px] text-neon tracking-widest uppercase mb-4">
                {t(col.headingKey)}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="font-body text-sm text-muted hover:text-text transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-edge pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted">
            {t("footer_copyright")}
          </p>
          <p className="font-mono text-xs text-muted flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-neon"
              style={{ animation: "blink-dot 2s ease infinite" }}
            />
            {t("footer_status")}
          </p>
        </div>
      </div>
    </footer>
  );
}

// =============================================================
// Landing Page
// ==============================================================

export default function LandingPage() {
  return (
    <div className="marketing-scope bg-ground text-text font-body overflow-x-hidden">
      <Nav />
      <Hero />
      <MetricsTicker />
      <RouteBuilderSection />
      <LiveCockpitSection />
      <GeofenceSection />
      <ROICalculatorSection />
      <CTASection />
      <Footer />
    </div>
  );
}
