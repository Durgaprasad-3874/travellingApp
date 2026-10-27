import { useId } from 'react';

/**
 * Travel-poster artwork, drawn in code so the site needs no image files.
 * Each destination picks a scene and a palette (data/destinations.js).
 * `shape="portrait"` is a 400x500 canvas, `shape="wide"` is 800x400. Both are
 * scaled with "slice", so the artwork fills any container and crops evenly.
 */

// --- helpers -----------------------------------------------------------

function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Blend two #rrggbb colors; t=0 gives a, t=1 gives b. */
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${[16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, '0')).join('')}`;
}

function Sun({ x, y, r, fill, animate, halo = true }) {
  return (
    <g className={animate ? 'sun-rise' : undefined}>
      {halo && <circle cx={x} cy={y} r={r * 1.5} fill="#FFFFFF" opacity="0.28" />}
      <circle cx={x} cy={y} r={r} fill={fill} />
    </g>
  );
}

function Pine({ x, y, k, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill={fill}>
      <polygon points="0,-66 13,-40 -13,-40" />
      <polygon points="0,-52 17,-24 -17,-24" />
      <polygon points="0,-36 21,-4 -21,-4" />
      <rect x="-2.5" y="-4" width="5" height="9" />
    </g>
  );
}

function Palm({ x, y, k, trunk, leaf }) {
  const crown = [4, -100];
  const fronds = [172, 204, 238, 302, 336, 8].map((deg) => {
    const a = (deg * Math.PI) / 180;
    const len = 46;
    const ex = crown[0] + len * Math.cos(a);
    const ey = crown[1] + len * Math.sin(a) + 20;
    const cx = crown[0] + len * 0.5 * Math.cos(a);
    const cy = crown[1] + len * 0.5 * Math.sin(a) - 16;
    return `M${crown[0]} ${crown[1]} Q${cx} ${cy} ${ex} ${ey}`;
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill="none" strokeLinecap="round">
      <path d="M0 0 Q12 -50 4 -100" stroke={trunk} strokeWidth="6" />
      {fronds.map((d) => (
        <path key={d} d={d} stroke={leaf} strokeWidth="6" />
      ))}
    </g>
  );
}

/** A jagged mountain range. `heights` alternate valley, peak, valley... as fractions of `scale`. */
function Range({ W, base, heights, scale, fill, snow }) {
  const n = heights.length;
  const pts = heights.map((h, i) => [(W * i) / (n - 1), base - h * scale]);
  const d = `M0 ${base} ${pts.map(([x, y]) => `L${x} ${y}`).join(' ')} L${W} ${base}Z`;
  const caps = snow
    ? pts.map(([x, y], i) => {
        if (i % 2 === 0) return null; // odd indexes are the peaks
        const [lx, ly] = pts[i - 1];
        const [rx, ry] = pts[i + 1];
        const a = [x + (lx - x) * 0.32, y + (ly - y) * 0.32];
        const b = [x + (rx - x) * 0.32, y + (ry - y) * 0.32];
        const dip = (a[1] - y) * 0.14;
        const list = [
          [x, y],
          a,
          [a[0] + (x - a[0]) * 0.35, a[1] - (a[1] - y) * 0.35],
          [x, a[1] + dip],
          [b[0] + (x - b[0]) * 0.35, b[1] - (b[1] - y) * 0.35],
          b,
        ];
        return <polygon key={i} points={list.map((q) => q.join(',')).join(' ')} fill={snow} />;
      })
    : null;
  return (
    <g>
      <path d={d} fill={fill} />
      {caps}
    </g>
  );
}

function ridgeHeights(rand, n, [peakLo, peakHi], [valLo, valHi]) {
  return Array.from({ length: n }, (_, i) =>
    i % 2 ? peakLo + rand() * (peakHi - peakLo) : valLo + rand() * (valHi - valLo),
  );
}

// --- scenes ------------------------------------------------------------

function Sea({ W, H, p, animateSun }) {
  const s = Math.min(W / 400, H / 500);
  const hz = H * 0.56;
  const sx = W * 0.68;
  return (
    <>
      <Sun x={sx} y={H * 0.3} r={H * 0.12} fill={p.sun} animate={animateSun} />
      <rect y={hz} width={W} height={H - hz} fill={p.far} />
      <rect y={hz + (H - hz) * 0.3} width={W} height={H} fill={p.mid} />
      <rect y={hz + (H - hz) * 0.66} width={W} height={H} fill={p.near} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={sx - (34 - i * 6) * s}
          y={hz + (7 + i * 11) * s}
          width={(68 - i * 12) * s}
          height={3 * s}
          rx={1.5 * s}
          fill={p.sun}
          opacity="0.8"
        />
      ))}
      <path d={`M${W * 0.04} ${hz + 3 * s} Q${W * 0.2} ${hz - 34 * s} ${W * 0.36} ${hz + 3 * s}Z`} fill={p.accent} />
      <Palm x={W * 0.2} y={hz - 14 * s} k={0.72 * s} trunk={mix(p.accent, '#000000', 0.45)} leaf={mix(p.accent, '#000000', 0.25)} />
      <Palm x={W * 0.3} y={hz - 4 * s} k={0.45 * s} trunk={mix(p.accent, '#000000', 0.45)} leaf={mix(p.accent, '#000000', 0.25)} />
      <rect x={W * 0.44} y={hz + 22 * s} width={W * 0.42} height={3 * s} fill={p.accent2} />
      {[0, 1, 2].map((i) => {
        const x = W * (0.48 + i * 0.12);
        const y = hz + 8 * s;
        return (
          <g key={i}>
            <rect x={x} y={y} width={34 * s} height={14 * s} fill="#FFFFFF" />
            <polygon points={`${x - 5 * s},${y} ${x + 17 * s},${y - 15 * s} ${x + 39 * s},${y}`} fill={p.accent2} />
            {[7, 17, 27].map((dx) => (
              <line key={dx} x1={x + dx * s} y1={y + 14 * s} x2={x + dx * s} y2={y + 28 * s} stroke={p.near} strokeWidth={2 * s} />
            ))}
          </g>
        );
      })}
    </>
  );
}

function Dome({ W, H, p, animateSun }) {
  const s = Math.min(W / 400, H / 500);
  const hz = H * 0.5;
  const top = H * 0.6; // cliff top
  const buildings = [
    { x: 0.44, w: 0.13, h: 0.075, dome: true },
    { x: 0.58, w: 0.11, h: 0.11 },
    { x: 0.7, w: 0.14, h: 0.065, dome: true },
    { x: 0.85, w: 0.12, h: 0.095 },
  ];
  return (
    <>
      <Sun x={W * 0.26} y={H * 0.24} r={H * 0.1} fill={p.sun} animate={animateSun} />
      <rect y={hz} width={W} height={H - hz} fill={p.far} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={W * (0.03 + i * 0.09)} y={hz + (16 + i * 26) * s} width={W * 0.24} height={2.5 * s} fill={p.sky2} opacity="0.45" />
      ))}
      <path
        d={`M${W * 0.28} ${H} L${W * 0.33} ${top + H * 0.08} Q${W * 0.38} ${top} ${W * 0.48} ${top} L${W} ${top} L${W} ${H}Z`}
        fill={p.mid}
      />
      <path d={`M${W * 0.3} ${H * 0.84} L${W} ${H * 0.78} L${W} ${H} L${W * 0.28} ${H}Z`} fill={mix(p.mid, '#000000', 0.2)} />
      {buildings.map((b, i) => {
        const x = b.x * W;
        const w = b.w * W;
        const h = b.h * H;
        const y = top - h + 2;
        const cx = x + w / 2;
        const r = w * 0.34;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={p.near} />
            <rect x={x + w * 0.18} y={y + h * 0.42} width={w * 0.16} height={h * 0.58} fill={p.accent} opacity="0.85" />
            <rect x={x + w * 0.58} y={y + h * 0.3} width={w * 0.14} height={h * 0.28} fill={p.accent} opacity="0.6" />
            {b.dome && (
              <>
                <path d={`M${cx - r} ${y} A${r} ${r} 0 0 1 ${cx + r} ${y}Z`} fill={p.accent} />
                <rect x={cx - 1.2 * s} y={y - r - 7 * s} width={2.4 * s} height={7 * s} fill={p.near} />
              </>
            )}
          </g>
        );
      })}
      <g>
        <rect x={W * 0.52} y={top - H * 0.17} width={W * 0.045} height={H * 0.17 + 2} fill={p.near} />
        <rect x={W * 0.5235} y={top - H * 0.15} width={W * 0.0155} height={H * 0.035} fill={p.accent2} />
        <polygon points={`${W * 0.52},${top - H * 0.17} ${W * 0.5425},${top - H * 0.215} ${W * 0.565},${top - H * 0.17}`} fill={p.accent} />
      </g>
    </>
  );
}

function Peaks({ W, H, p, variant, seed, animateSun }) {
  const rand = rng(seed);
  const s = Math.min(W / 400, H / 500);
  const S = Math.min(W, H);
  const lake = variant === 'lake';
  const base = H * (lake ? 0.66 : 0.8);
  const n = 2 * Math.round(W / 132) + 1;
  const far = ridgeHeights(rand, n, [0.3, 0.44], [0.14, 0.24]);
  const mid = ridgeHeights(rand, n, [0.18, 0.28], [0.07, 0.13]);
  const uid = useId().replace(/:/g, '');
  const pines = Array.from({ length: Math.round(W / 26) }, () => ({
    x: rand() * W,
    y: H * (0.88 + rand() * 0.1),
    k: (0.55 + rand() * 0.6) * s,
  })).sort((a, b) => a.y - b.y);

  return (
    <>
      <Sun x={W * 0.74} y={H * 0.22} r={S * 0.085} fill={p.sun} animate={animateSun} />
      <Range W={W} base={base} heights={far} scale={S} fill={p.far} snow={p.accent} />
      <Range W={W} base={base} heights={mid} scale={S} fill={p.mid} />
      {lake ? (
        <>
          <rect y={base} width={W} height={H - base} fill={p.accent2} />
          <clipPath id={`${uid}-lake`}>
            <rect y={base} width={W} height={H - base} />
          </clipPath>
          <g clipPath={`url(#${uid}-lake)`} opacity="0.3">
            <g transform={`translate(0 ${base * 2}) scale(1 -1)`}>
              <Range W={W} base={base} heights={far} scale={S} fill={p.far} snow={p.accent} />
              <Range W={W} base={base} heights={mid} scale={S} fill={p.mid} />
            </g>
          </g>
          <path d={`M0 ${H * 0.84} Q${W * 0.16} ${H * 0.9} ${W * 0.28} ${H}L0 ${H}Z`} fill={p.near} />
          <path d={`M${W} ${H * 0.86} Q${W * 0.86} ${H * 0.92} ${W * 0.74} ${H}L${W} ${H}Z`} fill={p.near} />
          {pines
            .filter((q) => q.x < W * 0.22 || q.x > W * 0.8)
            .map((q, i) => (
              <Pine key={i} x={q.x} y={q.y} k={q.k * 1.15} fill={p.near} />
            ))}
        </>
      ) : (
        <>
          <rect y={base} width={W} height={H * 0.09} fill={p.accent2} />
          <rect y={H * 0.86} width={W} height={H * 0.14} fill={mix(p.near, p.accent2, 0.28)} />
          {pines.map((q, i) => (
            <Pine key={i} x={q.x} y={q.y} k={q.k} fill={p.near} />
          ))}
        </>
      )}
    </>
  );
}

function Skyline({ W, H, p, seed, animateSun }) {
  const rand = rng(seed);
  const s = Math.min(W / 400, H / 500);
  const tones = [p.mid, mix(p.mid, p.near, 0.25), mix(p.mid, '#FFFFFF', 0.4), mix(p.mid, p.accent2, 0.35)];
  const rows = [
    { base: H * 0.69, hMin: 30, hMax: 54, tint: 0.18 },
    { base: H * 0.82, hMin: 26, hMax: 46, tint: 0 },
  ];
  const houses = rows.map((row, ri) => {
    const list = [];
    let x = -6 * s;
    while (x < W) {
      const w = (26 + rand() * 20) * s;
      const h = (row.hMin + rand() * (row.hMax - row.hMin)) * s;
      list.push({ x, w, h, tone: tones[Math.floor(rand() * tones.length)], roof: rand() > 0.35, key: `${ri}-${x}` });
      x += w + (1 + rand() * 2) * s;
    }
    return list;
  });
  return (
    <>
      <Sun x={W * 0.7} y={H * 0.26} r={H * 0.1} fill={p.sun} animate={animateSun} />
      <path d={`M0 ${H * 0.52} Q${W * 0.3} ${H * 0.42} ${W * 0.6} ${H * 0.55} T${W} ${H * 0.5}L${W} ${H}L0 ${H}Z`} fill={p.far} />
      {rows.map((row, ri) => (
        <g key={ri}>
          <rect y={row.base} width={W} height={H} fill={ri === 0 ? mix(p.mid, p.far, 0.4) : p.mid} />
          {houses[ri].map((h) => (
            <g key={h.key}>
              <rect x={h.x} y={row.base - h.h} width={h.w} height={h.h + 1} fill={mix(h.tone, p.far, row.tint)} />
              {h.roof ? (
                <polygon
                  points={`${h.x - 2 * s},${row.base - h.h} ${h.x + h.w / 2},${row.base - h.h - 11 * s} ${h.x + h.w + 2 * s},${row.base - h.h}`}
                  fill={p.near}
                />
              ) : (
                <rect x={h.x - 1} y={row.base - h.h - 3 * s} width={h.w + 2} height={3 * s} fill={p.near} />
              )}
              <rect x={h.x + h.w * 0.2} y={row.base - h.h * 0.7} width={h.w * 0.2} height={h.h * 0.28} fill={p.accent} opacity="0.55" />
              <rect x={h.x + h.w * 0.6} y={row.base - h.h * 0.7} width={h.w * 0.2} height={h.h * 0.28} fill={p.accent} opacity="0.55" />
            </g>
          ))}
        </g>
      ))}
      <g>
        <rect x={W * 0.3} y={H * 0.45} width={26 * s} height={H * 0.25} fill={mix(p.mid, '#FFFFFF', 0.5)} />
        <path d={`M${W * 0.3 - 2 * s} ${H * 0.45} A${15 * s} ${15 * s} 0 0 1 ${W * 0.3 + 28 * s} ${H * 0.45}Z`} fill={p.near} />
        <rect x={W * 0.3 + 9 * s} y={H * 0.5} width={8 * s} height={14 * s} rx={4 * s} fill={p.accent} opacity="0.7" />
      </g>
      <rect y={H * 0.9} width={W} height={H * 0.1} fill={p.accent} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={W * (0.1 + i * 0.24)} y={H * (0.935 + (i % 2) * 0.02)} width={W * 0.12} height={2.4 * s} rx={1.2 * s} fill="#FFFFFF" opacity="0.55" />
      ))}
    </>
  );
}

function Pagoda({ W, H, p, animateSun }) {
  const s = Math.min(W / 400, H / 500);
  const cx = W * 0.5;
  const ground = H * 0.82;
  const tiers = [0, 1, 2, 3, 4];
  const tree = (x, flip) => (
    <g>
      <rect x={x - 3 * s} y={ground - 80 * s} width={6 * s} height={84 * s} fill={p.near} />
      {[
        [0, -96, 30],
        [-24, -78, 24],
        [24, -80, 26],
        [-10, -112, 22],
        [14, -108, 22],
      ].map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx * s * flip} cy={ground + dy * s} r={r * s} fill={i % 2 ? p.accent2 : p.accent} />
      ))}
    </g>
  );
  return (
    <>
      <Sun x={cx} y={H * 0.36} r={H * 0.17} fill={p.sun} animate={animateSun} />
      <path d={`M0 ${H * 0.62} Q${W * 0.18} ${H * 0.5} ${W * 0.38} ${H * 0.62} T${W * 0.78} ${H * 0.6} T${W} ${H * 0.58}L${W} ${H}L0 ${H}Z`} fill={p.far} />
      <path d={`M0 ${H * 0.72} Q${W * 0.25} ${H * 0.62} ${W * 0.5} ${H * 0.72} T${W} ${H * 0.7}L${W} ${H}L0 ${H}Z`} fill={p.mid} />
      {/* pagoda, scaled up around its base */}
      <g transform={`translate(${cx} ${ground}) scale(1.3) translate(${-cx} ${-ground})`}>
        {tiers.map((i) => {
          const w = (112 - i * 17) * s;
          const bodyH = 21 * s;
          const roofH = 12 * s;
          const yBottom = ground - i * (bodyH + roofH);
          return (
            <g key={i}>
              <rect x={cx - w * 0.36} y={yBottom - bodyH - roofH} width={w * 0.72} height={bodyH} fill={p.accent} />
              <path
                d={`M${cx - w / 2 - 18 * s} ${yBottom - roofH + 2 * s} Q${cx - w / 2 - 4 * s} ${yBottom - roofH - 1 * s} ${cx - w / 2 + 4 * s} ${yBottom - roofH - 7 * s} L${cx + w / 2 - 4 * s} ${yBottom - roofH - 7 * s} Q${cx + w / 2 + 4 * s} ${yBottom - roofH - 1 * s} ${cx + w / 2 + 18 * s} ${yBottom - roofH + 2 * s}Z`}
                fill={p.near}
              />
            </g>
          );
        })}
        <rect x={cx - 1.5 * s} y={ground - 5 * (33 * s) - 38 * s} width={3 * s} height={34 * s} fill={p.near} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={cx} cy={ground - 5 * (33 * s) - (14 + i * 9) * s} r={(5 - i) * s} fill="none" stroke={p.near} strokeWidth={1.6 * s} />
        ))}
      </g>
      <rect y={ground} width={W} height={H - ground} fill={p.near} />
      {tree(W * 0.12, 1)}
      {tree(W * 0.88, -1)}
    </>
  );
}

function Dunes({ W, H, p, animateSun }) {
  const s = Math.min(W / 400, H / 500);
  const mx = W * 0.7;
  return (
    <>
      <Sun x={W * 0.28} y={H * 0.28} r={H * 0.12} fill={p.sun} animate={animateSun} />
      {/* minaret */}
      <g>
        <rect x={mx - 20 * s} y={H * 0.36} width={40 * s} height={H * 0.4} fill={mix(p.mid, p.sky2, 0.3)} />
        <rect x={mx - 20 * s} y={H * 0.36} width={40 * s} height={8 * s} fill={p.accent} />
        {[0, 1].map((i) => (
          <rect key={i} x={mx - 11 * s} y={H * (0.42 + i * 0.07)} width={22 * s} height={22 * s} rx={11 * s} fill={p.near} opacity="0.3" />
        ))}
        <rect x={mx - 12 * s} y={H * 0.36 - 18 * s} width={24 * s} height={18 * s} fill={mix(p.mid, p.sky2, 0.3)} />
        <path d={`M${mx - 10 * s} ${H * 0.36 - 18 * s} A${10 * s} ${10 * s} 0 0 1 ${mx + 10 * s} ${H * 0.36 - 18 * s}Z`} fill={p.accent} />
        <circle cx={mx} cy={H * 0.36 - 36 * s} r={4 * s} fill={p.accent2} />
      </g>
      <path d={`M0 ${H * 0.62} C${W * 0.25} ${H * 0.52} ${W * 0.5} ${H * 0.72} ${W * 0.75} ${H * 0.62} S${W * 0.95} ${H * 0.62} ${W} ${H * 0.58}L${W} ${H}L0 ${H}Z`} fill={p.far} />
      <Palm x={W * 0.86} y={H * 0.72} k={0.7 * s} trunk={p.near} leaf={p.accent} />
      <Palm x={W * 0.93} y={H * 0.74} k={0.5 * s} trunk={p.near} leaf={p.accent} />
      <path d={`M0 ${H * 0.75} C${W * 0.3} ${H * 0.64} ${W * 0.55} ${H * 0.84} ${W} ${H * 0.7}L${W} ${H}L0 ${H}Z`} fill={p.mid} />
      <path d={`M0 ${H * 0.88} C${W * 0.35} ${H * 0.8} ${W * 0.7} ${H * 0.96} ${W} ${H * 0.84}L${W} ${H}L0 ${H}Z`} fill={p.near} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${W * (0.1 + i * 0.3)} ${H * (0.8 + i * 0.012)} q${14 * s} ${-5 * s} ${34 * s} 0`} stroke={p.accent2} strokeWidth={2 * s} fill="none" opacity="0.5" strokeLinecap="round" />
      ))}
    </>
  );
}

function Terraces({ W, H, p, variant, animateSun }) {
  const s = Math.min(W / 400, H / 500);
  const stone = variant === 'stone';
  const bands = [
    { y: 0.52, fill: p.far },
    { y: 0.6, fill: p.mid },
    { y: 0.68, fill: p.accent2 },
    { y: 0.76, fill: p.mid },
    { y: 0.84, fill: p.near },
    { y: 0.92, fill: mix(p.near, '#000000', 0.2) },
  ];
  return (
    <>
      <Sun x={W * 0.76} y={H * 0.2} r={H * 0.09} fill={p.sun} animate={animateSun} />
      {stone ? (
        <>
          <path d={`M${W * 0.36} ${H * 0.6} L${W * 0.5} ${H * 0.3} Q${W * 0.56} ${H * 0.16} ${W * 0.62} ${H * 0.2} L${W * 0.7} ${H * 0.6}Z`} fill={mix(p.far, p.sky, 0.25)} />
          <path d={`M0 ${H * 0.6} L${W * 0.2} ${H * 0.4} L${W * 0.36} ${H * 0.6}Z`} fill={mix(p.far, p.sky, 0.45)} />
          <path d={`M${W * 0.62} ${H * 0.6} L${W * 0.84} ${H * 0.36} L${W} ${H * 0.6}Z`} fill={mix(p.far, p.sky, 0.45)} />
        </>
      ) : (
        <path d={`M${W * 0.04} ${H * 0.6} C${W * 0.16} ${H * 0.38} ${W * 0.24} ${H * 0.3} ${W * 0.32} ${H * 0.22} C${W * 0.4} ${H * 0.3} ${W * 0.5} ${H * 0.42} ${W * 0.66} ${H * 0.6}Z`} fill={p.far} />
      )}
      {bands.map((b, i) => {
        const y = H * b.y;
        const wave = (i % 2 ? 1 : -1) * 12 * s;
        const edge = stone
          ? `M0 ${y} H${W * 0.22} V${y - 5 * s} H${W * 0.5} V${y + 2 * s} H${W * 0.78} V${y - 4 * s} H${W}`
          : `M0 ${y} C${W * 0.25} ${y - wave} ${W * 0.55} ${y + wave} ${W} ${y - wave * 0.4}`;
        return (
          <g key={i}>
            <path d={`${edge} L${W} ${H} L0 ${H}Z`} fill={b.fill} />
            <path d={edge} fill="none" stroke={stone ? p.accent : p.accent} strokeWidth={stone ? 3 * s : 2.2 * s} opacity={stone ? 0.9 : 0.55} />
          </g>
        );
      })}
      {stone &&
        [0.3, 0.46, 0.6].map((x, i) => (
          <g key={i}>
            <rect x={W * x} y={H * 0.5 - i * 4 * s} width={24 * s} height={14 * s} fill={p.accent} />
            <polygon points={`${W * x - 3 * s},${H * 0.5 - i * 4 * s} ${W * x + 12 * s},${H * 0.5 - i * 4 * s - 10 * s} ${W * x + 27 * s},${H * 0.5 - i * 4 * s}`} fill={mix(p.accent, p.near, 0.55)} />
          </g>
        ))}
      {!stone && (
        <>
          <Palm x={W * 0.08} y={H * 0.92} k={0.95 * s} trunk={mix(p.near, '#000000', 0.3)} leaf={p.near} />
          <Palm x={W * 0.18} y={H * 0.98} k={0.65 * s} trunk={mix(p.near, '#000000', 0.3)} leaf={p.near} />
        </>
      )}
    </>
  );
}

function Savanna({ W, H, p, seed, animateSun }) {
  const rand = rng(seed);
  const s = Math.min(W / 400, H / 500);
  const hz = H * 0.62;
  const acacia = (x, base, k) => (
    <g transform={`translate(${x} ${base}) scale(${k})`} fill={p.near}>
      <path d="M-4 0 Q-2 -40 -14 -64 L-9 -66 Q2 -50 4 -34 Q8 -52 18 -70 L22 -67 Q10 -48 8 0Z" />
      <ellipse cx="0" cy="-74" rx="74" ry="12" />
      <ellipse cx="-34" cy="-66" rx="38" ry="9" />
      <ellipse cx="38" cy="-67" rx="36" ry="9" />
    </g>
  );
  return (
    <>
      <Sun x={W * 0.5} y={hz - H * 0.06} r={H * 0.17} fill={p.sun} animate={animateSun} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${W * (0.12 + i * 0.3)} ${H * 0.2 + i * 14 * s} l${7 * s} ${5 * s} l${7 * s} ${-5 * s}`} stroke={p.near} strokeWidth={2 * s} fill="none" strokeLinecap="round" />
      ))}
      <path d={`M0 ${hz - 4 * s} Q${W * 0.15} ${hz - H * 0.07} ${W * 0.3} ${hz - 4 * s} T${W * 0.62} ${hz - 6 * s} T${W} ${hz - 3 * s}L${W} ${H}L0 ${H}Z`} fill={p.far} />
      <rect y={hz} width={W} height={H - hz} fill={p.mid} />
      {Array.from({ length: 16 }, (_, i) => {
        const x = W * (0.08 + rand() * 0.84);
        const y = hz + (6 + rand() * 26) * s;
        return <ellipse key={i} cx={x} cy={y} rx={4.5 * s} ry={2.2 * s} fill={p.near} opacity="0.75" />;
      })}
      <path d={`M0 ${H * 0.86} Q${W * 0.3} ${H * 0.8} ${W * 0.6} ${H * 0.86} T${W} ${H * 0.84}L${W} ${H}L0 ${H}Z`} fill={p.accent} />
      {acacia(W * 0.3, H * 0.86, 1.15 * s)}
      {acacia(W * 0.8, H * 0.8, 0.7 * s)}
      <rect y={H * 0.93} width={W} height={H * 0.07} fill={p.near} />
    </>
  );
}

function Aurora({ W, H, p, seed, animateSun }) {
  const rand = rng(seed);
  const s = Math.min(W / 400, H / 500);
  const uid = useId().replace(/:/g, '');
  const n = 2 * Math.round(W / 150) + 1;
  const S = Math.min(W, H);
  const ridgeFar = ridgeHeights(rand, n, [0.2, 0.3], [0.08, 0.14]);
  const ridgeNear = ridgeHeights(rand, n, [0.12, 0.18], [0.05, 0.09]);
  const ribbon = (y, amp, thick) =>
    `M0 ${y} C${W * 0.25} ${y - amp} ${W * 0.5} ${y + amp} ${W} ${y - amp * 0.3} L${W} ${y - amp * 0.3 + thick} C${W * 0.5} ${y + amp + thick * 1.1} ${W * 0.25} ${y - amp + thick * 0.9} 0 ${y + thick}Z`;
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.accent} stopOpacity="0" />
          <stop offset="0.45" stopColor={p.accent} stopOpacity="0.75" />
          <stop offset="1" stopColor={p.accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.accent2} stopOpacity="0" />
          <stop offset="0.5" stopColor={p.accent2} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.accent2} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: Math.round(W / 9) }, (_, i) => (
        <circle key={i} cx={rand() * W} cy={rand() * H * 0.6} r={(0.5 + rand() * 1.2) * s} fill="#FFFFFF" opacity={0.35 + rand() * 0.6} />
      ))}
      <path d={ribbon(H * 0.2, 40 * s, 120 * s)} fill={`url(#${uid}-b)`} />
      <path d={ribbon(H * 0.14, -46 * s, 140 * s)} fill={`url(#${uid}-a)`} />
      <Sun x={W * 0.82} y={H * 0.15} r={S * 0.05} fill={p.sun} animate={animateSun} halo={false} />
      <Range W={W} base={H * 0.74} heights={ridgeFar} scale={S} fill={p.far} snow="#DCE7F5" />
      <Range W={W} base={H * 0.8} heights={ridgeNear} scale={S} fill={p.mid} />
      <rect y={H * 0.8} width={W} height={H * 0.2} fill={p.near} />
      {/* stepped church tower */}
      <g fill="#C6D3E6">
        <rect x={W * 0.3 - 11 * s} y={H * 0.56} width={22 * s} height={H * 0.26} />
        <polygon points={`${W * 0.3 - 11 * s},${H * 0.56} ${W * 0.3},${H * 0.5} ${W * 0.3 + 11 * s},${H * 0.56}`} />
        <polygon points={`${W * 0.3 - 11 * s},${H * 0.82} ${W * 0.3 - 11 * s},${H * 0.68} ${W * 0.3 - 28 * s},${H * 0.82}`} />
        <polygon points={`${W * 0.3 + 11 * s},${H * 0.82} ${W * 0.3 + 11 * s},${H * 0.68} ${W * 0.3 + 28 * s},${H * 0.82}`} />
      </g>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={W * 0.3 - 2.5 * s} y={H * (0.6 + i * 0.045)} width={5 * s} height={11 * s} fill={p.sun} opacity="0.85" />
      ))}
      {[0.5, 0.6, 0.7, 0.8].map((x, i) => (
        <g key={i}>
          <rect x={W * x} y={H * 0.8 - (12 + (i % 2) * 6) * s} width={26 * s} height={(14 + (i % 2) * 6) * s} fill={mix(p.near, p.far, 0.35)} />
          <polygon points={`${W * x - 2 * s},${H * 0.8 - (12 + (i % 2) * 6) * s} ${W * x + 13 * s},${H * 0.8 - (24 + (i % 2) * 6) * s} ${W * x + 28 * s},${H * 0.8 - (12 + (i % 2) * 6) * s}`} fill={p.near} />
          <rect x={W * x + 9 * s} y={H * 0.8 - 8 * s} width={7 * s} height={7 * s} fill={p.sun} opacity="0.8" />
        </g>
      ))}
    </>
  );
}

const SCENES = {
  sea: Sea,
  dome: Dome,
  peaks: Peaks,
  skyline: Skyline,
  pagoda: Pagoda,
  dunes: Dunes,
  terraces: Terraces,
  savanna: Savanna,
  aurora: Aurora,
};

// Real photos of each place from Wikimedia Commons (free-licensed; see footer credit).
const commons = (file) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`;

const DESTINATION_PHOTOS = {
  visakhapatnam: commons('RK Beach Visakhapatnam Nov 2012 - 02.JPG'),
  'araku-valley': commons('Araku Valley from Galikonda View Point 01.jpg'),
  tirupati: commons('A View of Tirumala Venkateswara Temple.JPG'),
  vijayawada: commons('Indrakeeladri and Prakasam Barrage from Tadepalli (01).jpg'),
  gandikota: commons('Grand Canon of India (Gandikota).jpg'),
  lepakshi: commons("Shiva's Bull at Lepakshi (Lepakshi Nandi).jpg"),
  rajahmundry: commons('Godavari Arch bridge at Rajahmundry.jpg'),
  srisailam: commons('Srisailam Dam (Perspective).jpg'),
  kakinada: commons('Coringa reserve forest park mangrove forest 01.jpg'),
  'horsley-hills': commons('Horsley Hills Andhra Pradesh JEG9209.JPG'),
};
// --- component ---------------------------------------------------------

export default function Poster({ destination, shape = 'portrait', animateSun = false, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const { scene, palette: p, variant } = destination.art;
  const [W, H] = shape === 'wide' ? [800, 400] : [400, 500];
  const Scene = SCENES[scene];
  const photoUrl = DESTINATION_PHOTOS[destination.id];

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.sky} />
            <stop offset="1" stopColor={p.sky2} />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#${uid}-sky)`} />
        <Scene W={W} H={H} p={p} variant={variant} seed={destination.id} animateSun={animateSun} />
      </svg>
      {photoUrl && (
        <img
          src={photoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
