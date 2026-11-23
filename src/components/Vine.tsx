const LEAF = "M0 0 C4 -8 13 -9 18 0 C13 7 4 7 0 0 Z";

type Leaf = [x: number, y: number, rotate: number];

function Leaves({ leaves }: { leaves: Leaf[] }) {
  return (
    <>
      {leaves.map(([x, y, r], i) => (
        <path
          key={i}
          d={LEAF}
          fill={i % 2 ? "var(--sage)" : "var(--leaf)"}
          transform={`translate(${x} ${y}) rotate(${r})`}
        />
      ))}
    </>
  );
}

/** Decorative vines that creep over buttons and eliminated players. */
export default function Vine({
  kind = "edge",
  width,
  height,
  className,
  flip = false,
}: {
  kind?: "edge" | "drape" | "corner";
  width?: number;
  height?: number;
  className?: string;
  flip?: boolean;
}) {
  const style = { transform: flip ? "scaleX(-1)" : undefined, pointerEvents: "none" as const };
  const stem = { stroke: "var(--stem)", fill: "none", strokeLinecap: "round" as const };

  if (kind === "drape") {
    return (
      <svg aria-hidden="true" width={width ?? 320} height={height ?? 90} viewBox="0 0 320 90" preserveAspectRatio="none" className={className} style={style}>
        <path d="M0 6 C60 14 100 0 160 8 S260 16 320 4" strokeWidth="3.5" {...stem} />
        <path d="M30 10 C24 30 38 46 30 70" strokeWidth="2.5" {...stem} />
        <path d="M110 6 C118 26 104 40 112 58" strokeWidth="2.5" {...stem} />
        <path d="M200 10 C192 34 206 52 198 84" strokeWidth="2.5" {...stem} />
        <path d="M280 10 C286 26 276 38 282 50" strokeWidth="2.5" {...stem} />
        <Leaves
          leaves={[
            [30, 28, 30], [30, 50, 150], [30, 68, 70], [70, 10, -20], [112, 26, 160], [112, 50, 40],
            [150, 8, 20], [200, 30, 30], [198, 56, 150], [198, 80, 60], [244, 12, -30], [282, 30, 140], [282, 48, 40],
          ]}
        />
      </svg>
    );
  }
  if (kind === "corner") {
    return (
      <svg aria-hidden="true" width={width ?? 110} height={height ?? 110} viewBox="0 0 120 120" className={className} style={style}>
        <path d="M2 2 C40 8 30 48 62 58 S100 86 118 118" strokeWidth="3.5" {...stem} />
        <path d="M30 20 C10 30 14 50 6 70" strokeWidth="2.5" {...stem} />
        <Leaves leaves={[[20, 6, 10], [40, 30, 100], [64, 56, -10], [88, 78, 80], [106, 100, 20], [12, 46, 120], [8, 66, 60]]} />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width={width ?? 200} height={height ?? 40} viewBox="0 0 240 48" className={className} style={style}>
      <path d="M0 20 C26 4 44 36 74 22 S124 4 152 24 S204 38 240 14" strokeWidth="3.5" {...stem} />
      <path d="M60 26 q8 10 -2 14 q-6 -2 -2 -6" strokeWidth="2" {...stem} />
      <path d="M170 28 q6 10 -3 13" strokeWidth="2" {...stem} />
      <Leaves leaves={[[14, 14, -30], [40, 22, 60], [88, 18, -50], [112, 12, 40], [140, 22, 80], [166, 26, -40], [196, 30, 50], [222, 20, -70]]} />
    </svg>
  );
}
