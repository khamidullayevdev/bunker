import { useMemo } from "react";

/** A five-pointed ivy leaf hanging from its stem point at (0,0), about 16px tall. */
const IVY_LEAF =
  "M0 0 C-2 -1 -6 1 -7 4 C-10 4 -11 8 -8 10 C-8 13 -4 14 0 17 C4 14 8 13 8 10 C11 8 10 4 7 4 C6 1 2 -1 0 0 Z";

const GREENS = ["#2f4a1e", "var(--leaf)", "#3f5c27", "var(--sage)"];

/** Small seeded random generator so the ivy looks the same on every render. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Leaf = { x: number; y: number; r: number; s: number; c: string };
type Strand = { d: string; leaves: Leaf[] };

/**
 * A hanging ivy curtain: a dense band of leaves along the top with strands and
 * thin aerial roots dropping down. Strands are longer at the sides and short in
 * the middle, so whatever sits underneath stays readable.
 */
export default function Ivy({
  width = 340,
  height = 140,
  seed = 7,
  className,
}: {
  width?: number;
  height?: number;
  seed?: number;
  className?: string;
}) {
  const art = useMemo(() => {
    const rand = rng(seed);
    const pick = () => GREENS[Math.floor(rand() * GREENS.length)];

    // Dense top band.
    const band: Leaf[] = [];
    for (let x = -4; x < width + 4; x += 7) {
      for (let row = 0; row < 2; row++) {
        band.push({ x: x + rand() * 6, y: row * 7 + rand() * 6, r: rand() * 80 - 40, s: 0.75 + rand() * 0.45, c: pick() });
      }
    }

    // Hanging strands.
    const strands: Strand[] = [];
    const count = Math.round(width / 26);
    for (let i = 0; i < count; i++) {
      const x = (i + 0.5) * (width / count) + (rand() - 0.5) * 12;
      const edge = Math.abs(x / width - 0.5) * 2; // 0 in the middle, 1 at the sides
      const length = height * (0.18 + 0.75 * edge * edge + rand() * 0.15);
      const sway = (rand() - 0.5) * 16;
      const d = `M${x} 8 C${x + sway} ${8 + length * 0.35} ${x - sway} ${8 + length * 0.7} ${x + sway * 0.4} ${8 + length}`;
      const leaves: Leaf[] = [];
      for (let y = 14; y < length; y += 9 + rand() * 4) {
        const t = y / length;
        const side = leaves.length % 2 ? 1 : -1;
        leaves.push({
          x: x + sway * Math.sin(t * Math.PI) * 0.5 + side * 2,
          y: 8 + y,
          r: side * (25 + rand() * 25),
          s: 0.95 - t * 0.45,
          c: pick(),
        });
      }
      strands.push({ d, leaves });
    }

    // Thin aerial roots, like real ivy.
    const roots: string[] = [];
    for (let i = 0; i < width / 14; i++) {
      const x = rand() * width;
      const edge = Math.abs(x / width - 0.5) * 2;
      const len = height * (0.12 + 0.45 * edge * rand());
      roots.push(`M${x} 10 q${(rand() - 0.5) * 6} ${len / 2} ${(rand() - 0.5) * 4} ${len}`);
    }

    return { band, strands, roots };
  }, [width, height, seed]);

  const leaf = (l: Leaf, key: number) => (
    <path key={key} d={IVY_LEAF} fill={l.c} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`} />
  );

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ pointerEvents: "none", overflow: "visible" }}
    >
      <g stroke="#3b2f25" strokeOpacity="0.45" strokeWidth="0.8" fill="none">
        {art.roots.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {art.strands.map((s, i) => (
        <g key={i}>
          <path d={s.d} stroke="var(--stem)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {s.leaves.map(leaf)}
        </g>
      ))}
      {art.band.map(leaf)}
    </svg>
  );
}
