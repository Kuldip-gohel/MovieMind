import React, { useEffect, useId, useRef, useState } from 'react';

/**
 * PosterArt – generative, resolution-independent poster artwork.
 * Used whenever a movie has no poster image (or the image fails to load), so
 * every title still gets a crisp, genre-aware cinematic poster. Pure SVG:
 * no external requests, no blurry upscaling.
 */

const THEMES = {
  'Sci-Fi': { a: '#57E6FF', b: '#FFB45C', d: '#06141f' },
  Action: { a: '#FFB45C', b: '#ff6a3d', d: '#1a0d08' },
  Adventure: { a: '#FFB45C', b: '#57E6FF', d: '#0b1620' },
  Animation: { a: '#57E6FF', b: '#FFB45C', d: '#0d1030' },
  Comedy: { a: '#FFB45C', b: '#ffe08a', d: '#1b1208' },
  Crime: { a: '#FFB45C', b: '#57E6FF', d: '#090b12' },
  Documentary: { a: '#9bd3e0', b: '#FFB45C', d: '#0b1116' },
  Drama: { a: '#FFB45C', b: '#f5e6cf', d: '#120d0a' },
  Fantasy: { a: '#b9a6ff', b: '#57E6FF', d: '#0b0a1f' },
  Horror: { a: '#ff5a5f', b: '#57E6FF', d: '#10060a' },
  Mystery: { a: '#57E6FF', b: '#b9a6ff', d: '#070c16' },
  Romance: { a: '#ff8fab', b: '#FFB45C', d: '#190a12' },
  Thriller: { a: '#57E6FF', b: '#ff5a5f', d: '#070b12' },
  Western: { a: '#ff9f5a', b: '#FFB45C', d: '#180b05' }
};
const DEFAULT_THEME = { a: '#57E6FF', b: '#FFB45C', d: '#080b14' };

function hashString(str = '') {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed) {
  let s = seed || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Stars({ rnd, color, count = 40, maxY = 420 }) {
  return Array.from({ length: count }).map((_, i) => (
    <circle
      key={i}
      cx={rnd() * 400}
      cy={rnd() * maxY}
      r={0.6 + rnd() * 1.6}
      fill={color}
      opacity={0.25 + rnd() * 0.6}
    />
  ));
}

function Mountains({ rnd, c1, c2, base = 470 }) {
  const layer = (amp, y, fill, op) => {
    let d = `M0 600 L0 ${y}`;
    for (let x = 0; x <= 400; x += 50) d += ` L${x + 25} ${y - rnd() * amp} L${x + 50} ${y - rnd() * amp * 0.3}`;
    d += ' L400 600 Z';
    return <path d={d} fill={fill} opacity={op} />;
  };
  return (
    <>
      {layer(110, base - 40, c2, 0.5)}
      {layer(90, base, c1, 0.85)}
      {layer(50, base + 50, '#05070b', 1)}
    </>
  );
}

function Motif({ genre, t, rnd, id }) {
  switch (genre) {
    case 'Sci-Fi':
      return (
        <>
          <Stars rnd={rnd} color="#fff" count={55} />
          <circle cx="210" cy="250" r="118" fill={`url(#${id}-planet)`} />
          <ellipse cx="210" cy="250" rx="210" ry="38" fill="none" stroke={t.a} strokeWidth="2.5" opacity="0.8" transform="rotate(-18 210 250)" />
          <ellipse cx="210" cy="250" rx="175" ry="28" fill="none" stroke={t.b} strokeWidth="1.2" opacity="0.6" transform="rotate(-18 210 250)" />
          <path d="M0 470 Q200 430 400 470 L400 600 L0 600Z" fill="#04080e" opacity="0.9" />
        </>
      );
    case 'Action':
      return (
        <>
          {Array.from({ length: 16 }).map((_, i) => (
            <polygon key={i} points={`200,330 ${200 + Math.cos((i * Math.PI) / 8) * 520},${330 + Math.sin((i * Math.PI) / 8) * 520} ${200 + Math.cos(((i + 0.5) * Math.PI) / 8) * 520},${330 + Math.sin(((i + 0.5) * Math.PI) / 8) * 520}`} fill={i % 2 ? t.a : t.b} opacity="0.13" />
          ))}
          <circle cx="200" cy="330" r="62" fill={t.a} opacity="0.9" />
          <polygon points="-20,560 120,360 160,360 20,600" fill="#05070b" opacity="0.85" />
          <polygon points="240,600 380,380 430,380 290,600" fill="#05070b" opacity="0.85" />
        </>
      );
    case 'Animation':
      return (
        <>
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx={40 + rnd() * 320} cy={80 + rnd() * 360} r={26 + rnd() * 70} fill={i % 3 === 0 ? t.a : i % 3 === 1 ? t.b : '#b9a6ff'} opacity={0.22 + rnd() * 0.3} />
          ))}
          <circle cx="200" cy="270" r="84" fill={`url(#${id}-planet)`} />
          <circle cx="170" cy="245" r="12" fill="#fff" opacity="0.9" />
        </>
      );
    case 'Drama':
      return (
        <>
          <polygon points="150,0 250,0 360,520 40,520" fill={`url(#${id}-beam)`} />
          <ellipse cx="200" cy="520" rx="150" ry="26" fill={t.a} opacity="0.28" />
          <circle cx="200" cy="396" r="17" fill="#04060a" />
          <path d="M178 418 Q200 408 222 418 L232 516 L168 516Z" fill="#04060a" />
        </>
      );
    case 'Thriller':
    case 'Mystery':
      return (
        <>
          <polygon points="-40,40 440,260 440,330 -40,110" fill={t.a} opacity="0.1" />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x="0" y={20 + i * 40} width="400" height={10 + (i % 3) * 6} fill={t.a} opacity={0.06 + (i % 4) * 0.045} />
          ))}
          {genre === 'Mystery' ? (
            <>
              <circle cx="200" cy="270" r="54" fill="#04060a" stroke={t.a} strokeWidth="3" />
              <path d="M200 300 L178 380 L222 380Z" fill="#04060a" stroke={t.a} strokeWidth="3" />
            </>
          ) : (
            <>
              <circle cx="200" cy="268" r="70" fill="none" stroke={t.b} strokeWidth="2" opacity="0.8" />
              <line x1="200" y1="170" x2="200" y2="366" stroke={t.b} strokeWidth="1.5" opacity="0.7" />
              <line x1="102" y1="268" x2="298" y2="268" stroke={t.b} strokeWidth="1.5" opacity="0.7" />
            </>
          )}
        </>
      );
    case 'Horror':
      return (
        <>
          <circle cx="260" cy="190" r="86" fill="#f3e9e4" opacity="0.92" />
          <circle cx="232" cy="170" r="14" fill="#d8c9c3" opacity="0.8" />
          <circle cx="285" cy="215" r="9" fill="#d8c9c3" opacity="0.8" />
          <Mountains rnd={rnd} c1="#12060a" c2={t.a} base={480} />
          <ellipse cx="120" cy="470" rx="190" ry="40" fill="#ffffff" opacity="0.1" filter={`url(#${id}-blur)`} />
          <ellipse cx="300" cy="510" rx="190" ry="36" fill="#ffffff" opacity="0.09" filter={`url(#${id}-blur)`} />
        </>
      );
    case 'Comedy':
      return (
        <>
          {Array.from({ length: 26 }).map((_, i) => (
            <circle key={i} cx={rnd() * 400} cy={rnd() * 470} r={4 + rnd() * 9} fill={i % 2 ? t.a : t.b} opacity="0.6" />
          ))}
          <circle cx="200" cy="270" r="100" fill={t.a} />
          <path d="M150 290 Q200 350 250 290" fill="none" stroke="#1b1208" strokeWidth="9" strokeLinecap="round" />
          <circle cx="166" cy="240" r="9" fill="#1b1208" />
          <circle cx="234" cy="240" r="9" fill="#1b1208" />
        </>
      );
    case 'Romance':
      return (
        <>
          <circle cx="160" cy="260" r="120" fill={t.a} opacity="0.5" />
          <circle cx="250" cy="290" r="120" fill={t.b} opacity="0.5" />
          <circle cx="205" cy="275" r="46" fill="#fff" opacity="0.35" />
          <Stars rnd={rnd} color="#fff" count={22} maxY={470} />
        </>
      );
    case 'Crime':
      return (
        <>
          <circle cx="290" cy="150" r="52" fill={t.a} opacity="0.85" />
          {Array.from({ length: 11 }).map((_, i) => {
            const w = 28 + rnd() * 26;
            const h = 120 + rnd() * 260;
            const x = i * 38 - 6;
            return (
              <g key={i}>
                <rect x={x} y={560 - h} width={w} height={h + 40} fill="#05070b" />
                {Array.from({ length: 6 }).map((__, j) => (
                  <rect key={j} x={x + 5 + (j % 2) * 12} y={570 - h + j * 26 + 8} width="5" height="7" fill={t.a} opacity={rnd() > 0.5 ? 0.8 : 0.12} />
                ))}
              </g>
            );
          })}
        </>
      );
    case 'Fantasy':
      return (
        <>
          <Stars rnd={rnd} color="#fff" count={40} maxY={330} />
          <circle cx="210" cy="190" r="80" fill={t.a} opacity="0.85" />
          <circle cx="238" cy="172" r="74" fill={t.d} />
          <Mountains rnd={rnd} c1="#0a0a1c" c2={t.b} base={450} />
        </>
      );
    case 'Adventure':
      return (
        <>
          <circle cx="200" cy="300" r="90" fill={`url(#${id}-planet)`} />
          <Mountains rnd={rnd} c1="#0a1520" c2={t.a} base={440} />
        </>
      );
    case 'Western':
      return (
        <>
          <circle cx="200" cy="330" r="110" fill={t.a} opacity="0.9" />
          <path d="M0 440 Q100 400 200 440 T400 430 L400 600 L0 600Z" fill="#0b0502" opacity="0.9" />
          <path d="M0 500 Q140 470 260 505 T400 495 L400 600 L0 600Z" fill="#000" />
        </>
      );
    case 'Documentary':
      return (
        <>
          {Array.from({ length: 9 }).map((_, i) => (
            <circle key={i} cx="200" cy="280" r={30 + i * 22} fill="none" stroke={i % 2 ? t.b : t.a} strokeWidth="1.4" opacity={0.7 - i * 0.06} />
          ))}
          <circle cx="200" cy="280" r="8" fill={t.a} />
        </>
      );
    default:
      return (
        <>
          <Stars rnd={rnd} color="#fff" count={36} />
          <circle cx="200" cy="270" r="96" fill={`url(#${id}-planet)`} />
          <ellipse cx="200" cy="270" rx="170" ry="30" fill="none" stroke={t.b} strokeWidth="2" opacity="0.7" transform="rotate(-14 200 270)" />
        </>
      );
  }
}

function splitTitle(title = '') {
  const words = title.toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((w) => {
    if ((line + ' ' + w).trim().length > 11 && line) {
      lines.push(line);
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export default function PosterArt({ movie, showTitle = false }) {
  const rawId = useId();
  const id = `pa${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const theme = THEMES[movie.genre] || DEFAULT_THEME;
  const rnd = seeded(hashString(`${movie.title}${movie.releaseYear}`));
  const lines = splitTitle(movie.title);
  const fontSize = Math.max(34, Math.min(64, 330 / Math.max(...lines.map((l) => l.length), 6)));

  return (
    <svg
      className="poster-art"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.d} />
          <stop offset="0.55" stopColor={theme.d} />
          <stop offset="1" stopColor="#05070b" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor={theme.a} stopOpacity="0.38" />
          <stop offset="1" stopColor={theme.a} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-planet`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.25" stopColor={theme.a} />
          <stop offset="1" stopColor={theme.d} />
        </radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.a} stopOpacity="0.6" />
          <stop offset="1" stopColor={theme.a} stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#05070b" stopOpacity="0" />
          <stop offset="1" stopColor="#05070b" stopOpacity="0.92" />
        </linearGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect width="400" height="600" fill={`url(#${id}-bg)`} />
      <rect width="400" height="600" fill={`url(#${id}-glow)`} />
      <Motif genre={movie.genre} t={theme} rnd={rnd} id={id} />
      <rect width="400" height="600" fill={`url(#${id}-shade)`} />
      {showTitle && (
        <g className="poster-art-title">
          {lines.map((l, i) => (
            <text
              key={l + i}
              x="30"
              y={560 - (lines.length - 1 - i) * (fontSize * 0.98) - 34}
              fontSize={fontSize}
              fill="#F5F5F5"
            >
              {l}
            </text>
          ))}
          <text x="30" y="572" fontSize="17" fill={theme.a} letterSpacing="4">
            {movie.releaseYear}
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * MoviePoster – real poster image when it loads, generated art underneath
 * as an instant placeholder and as the permanent fallback if the URL fails.
 */
export function MoviePoster({ movie, showTitle = false, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [movie.posterUrl]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  });

  const hasImage = Boolean(movie.posterUrl) && !failed;
  return (
    <div className={`poster ${className}`}>
      <PosterArt movie={movie} showTitle={showTitle && !(hasImage && loaded)} />
      {hasImage && (
        <img
          ref={imgRef}
          className={`poster-img ${loaded ? 'is-loaded' : ''}`}
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
