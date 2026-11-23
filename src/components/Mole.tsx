import type { MoleVariant } from "../../convex/lib/content";

export type MoleMood = "wave" | "guide" | "scared" | "sly" | "judge" | "laugh" | "party" | "sad";

type Pt = [number, number];

const SKINS: Record<MoleVariant, { body: string; belly: string }> = {
  classic: { body: "#7A6352", belly: "#B49A80" },
  zombie: { body: "#6F7F52", belly: "#9AA77A" },
  alien: { body: "#7C6A9E", belly: "#A797C4" },
  robot: { body: "#5C6B78", belly: "#8B9AA6" },
};

const PAW = "#F2A7A0";
const INK = "#16120E";
const HAIR = "#3A2619";
const HAIR_HI = "#5E3F28";
const SUIT = "#2456B3";
const SUIT_DARK = "#173B80";
const STRIPE = "#F4F4EE";
const GOLD = "#D4A72C";
const GOLD_DARK = "#8A6A12";
const BRUSH = "#7A1F2B";
const BAG = "#CFC2A3";
const LEATHER = "#6B4A2E";
const WEB_GREEN = "#1F7A4A";
const WEB_RED = "#C8202F";

/** His free (left) arm: elbow and paw for each mood. The right paw always holds the pin brush. */
const LEFT_ARM: Record<MoleMood, [Pt, Pt]> = {
  wave: [[172, 122], [176, 90]],
  guide: [[172, 146], [188, 132]],
  judge: [[174, 154], [160, 170]],
  sly: [[174, 154], [160, 170]],
  scared: [[172, 124], [160, 104]],
  laugh: [[162, 166], [138, 166]],
  party: [[172, 116], [174, 82]],
  sad: [[164, 162], [160, 184]],
};

const MOUTHS: Partial<Record<MoleMood, string>> = {
  wave: "M86 134 Q100 146 114 134",
  guide: "M86 134 Q100 146 114 134",
  judge: "M88 138 Q104 142 114 132",
  sly: "M88 138 Q104 142 114 132",
  party: "M84 134 Q100 150 116 134",
  sad: "M88 142 Q100 132 112 142",
};

const EYES: Record<MoleMood, "normal" | "happy" | "scared" | "sly" | "shades"> = {
  wave: "normal",
  guide: "normal",
  judge: "sly",
  sly: "sly",
  scared: "scared",
  laugh: "happy",
  party: "shades",
  sad: "normal",
};

/** A tracksuit sleeve: a thick limb with three white stripes along its outer side. */
function Sleeve({ pts, side }: { pts: Pt[]; side: 1 | -1 }) {
  const segs = pts.slice(1).map((b, i) => [pts[i], b] as const);
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} stroke={SUIT} strokeWidth="16" />
      {segs.map(([a, b], i) => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = (-dy / len) * side;
        const ny = (dx / len) * side;
        const t = 3 / len;
        const ax = a[0] + dx * t;
        const ay = a[1] + dy * t;
        const bx = b[0] - dx * t;
        const by = b[1] - dy * t;
        return [6, 3.6, 1.2].map((o) => (
          <line
            key={`${i}-${o}`}
            x1={ax + nx * o}
            y1={ay + ny * o}
            x2={bx + nx * o}
            y2={by + ny * o}
            stroke={STRIPE}
            strokeWidth="1.3"
          />
        ));
      })}
    </g>
  );
}

/** The wooden pin brush he never puts down, drawn with its head up at (0,0). */
function PinBrush() {
  const pins: Pt[] = [];
  for (let y = -9; y <= 9; y += 3.6) for (let x = -5; x <= 5; x += 3.4) if ((x * x) / 36 + (y * y) / 110 < 1) pins.push([x, y]);
  return (
    <g>
      <path d="M-3 12 L-4.5 34 Q0 37 4.5 34 L3 12 Z" fill={BRUSH} />
      <ellipse cx="0" cy="0" rx="10" ry="14" fill={BRUSH} />
      <ellipse cx="0" cy="0" rx="7" ry="11" fill="#F1EEE8" />
      {pins.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" fill="#8C8C8C" />
      ))}
    </g>
  );
}

/** The mini monogram bag on a striped strap, worn across the chest. */
function MiniBag() {
  const dots: Pt[] = [];
  for (let y = 164; y <= 177; y += 4.5) for (let x = 63; x <= 85; x += 4.5) if (Math.abs(x - 74) > 3) dots.push([x, y]);
  return (
    <g>
      <path d="M150 136 L80 162" stroke={WEB_GREEN} strokeWidth="5" strokeLinecap="round" />
      <path d="M150 136 L80 162" stroke={WEB_RED} strokeWidth="1.8" />
      <rect x="56" y="158" width="36" height="22" rx="3.5" fill={BAG} stroke={LEATHER} strokeWidth="1.8" />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="#8C7656" opacity="0.7" />
      ))}
      <rect x="56" y="158" width="5" height="22" rx="2" fill={LEATHER} />
      <rect x="87" y="158" width="5" height="22" rx="2" fill={LEATHER} />
      <rect x="71" y="158" width="6" height="22" fill={WEB_GREEN} />
      <rect x="73" y="158" width="2" height="22" fill={WEB_RED} />
      <path d="M58 161 L90 161" stroke={LEATHER} strokeWidth="1.4" />
      <circle cx="74" cy="168" r="3.8" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1.2" />
      <circle cx="74" cy="168" r="1.5" fill={BAG} />
    </g>
  );
}

/**
 * Qilichbek, the bunker's mole: derski street guy in a striped tracksuit, with
 * a side-swept fringe, a mini monogram bag across the chest and a pin brush in
 * his right paw. Pure SVG, scales to any size.
 */
export default function Mole({
  mood = "wave",
  variant = "classic",
  size = 160,
  className,
  label,
}: {
  mood?: MoleMood;
  variant?: MoleVariant;
  size?: number;
  className?: string;
  label?: string;
}) {
  const { body, belly } = SKINS[variant];
  const [elbow, hand] = LEFT_ARM[mood];
  const eyes = variant === "robot" && mood !== "party" ? "visor" : EYES[mood];
  const open = mood === "laugh" || mood === "scared";

  return (
    <svg role="img" aria-label={label ?? "Qilichbek"} width={size} height={size} viewBox="0 0 200 200" className={className}>
      <ellipse cx="100" cy="193" rx="54" ry="5" fill="#000" opacity="0.28" />
      {mood === "party" && (
        <g>
          <rect x="18" y="30" width="8" height="4" rx="1" fill="#DAB716" transform="rotate(25 22 32)" />
          <rect x="176" y="24" width="8" height="4" rx="1" fill="#FF671A" transform="rotate(-30 180 26)" />
          <rect x="14" y="120" width="7" height="4" rx="1" fill="#9BA685" transform="rotate(-15 17 122)" />
          <rect x="184" y="64" width="7" height="4" rx="1" fill="#FA3518" transform="rotate(40 187 66)" />
          <circle cx="150" cy="16" r="3" fill="#EBEBD8" />
        </g>
      )}
      {variant === "robot" && (
        <g>
          <line x1="112" y1="66" x2="116" y2="36" stroke="#8B9AA6" strokeWidth="4" />
          <circle cx="116" cy="32" r="7" fill="#FF4D5E" />
        </g>
      )}
      {variant === "alien" && (
        <g>
          <path d="M84 68 Q76 48 66 38" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M116 68 Q124 48 134 38" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="65" cy="36" r="7" fill="#B6F23A" />
          <circle cx="135" cy="36" r="7" fill="#B6F23A" />
        </g>
      )}

      {/* white sneakers instead of bare paws */}
      <path d="M58 190 Q58 178 76 178 Q94 178 94 190 Z" fill="#F4F4EE" />
      <path d="M106 190 Q106 178 124 178 Q142 178 142 190 Z" fill="#F4F4EE" />
      <path d="M58 190 L94 190 M106 190 L142 190" stroke="#9A968A" strokeWidth="2.4" />

      {/* the mole */}
      <ellipse cx="100" cy="128" rx="64" ry="62" fill={body} />
      <ellipse cx="100" cy="150" rx="40" ry="36" fill={belly} />

      {/* tracksuit jacket: the lower body, cut along its outline, with a V-neck */}
      <path d="M36.5 136 L82 136 L100 156 L118 136 L163.5 136 A64 62 0 0 1 36.5 136 Z" fill={SUIT} />
      <path d="M82 136 L100 156 L118 136" stroke={STRIPE} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
      <path d="M100 157 L100 190" stroke={SUIT_DARK} strokeWidth="2" />
      <path d="M86 138 Q100 160 114 138" stroke={GOLD} strokeWidth="1.8" fill="none" strokeDasharray="2.4 1.2" />
      {variant === "zombie" && (
        <g stroke="#3B2A1E" strokeLinecap="round">
          <path d="M136 118 L152 106" strokeWidth="2.5" />
          <path d="M139 110 L144 118 M145 106 L150 114" strokeWidth="2" />
        </g>
      )}
      {variant === "robot" && (
        <g fill="#8B9AA6">
          <circle cx="44" cy="118" r="4" />
          <circle cx="156" cy="118" r="4" />
        </g>
      )}

      {/* left arm, posed by mood */}
      <Sleeve pts={[[152, 146], elbow, hand]} side={1} />
      <ellipse cx={hand[0]} cy={hand[1]} rx="11" ry="9" fill={PAW} />
      {mood === "wave" && (
        <g stroke="#EBEBD8" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M188 70 Q195 80 188 92" opacity="0.8" />
          <path d="M195 64 Q204 80 195 98" opacity="0.5" />
        </g>
      )}

      <MiniBag />

      {/* face */}
      <circle cx="68" cy="114" r="8" fill="#E98B8B" opacity="0.55" />
      <circle cx="132" cy="114" r="8" fill="#E98B8B" opacity="0.55" />
      {eyes === "normal" && (
        <g>
          <circle cx="80" cy="96" r="6" fill={INK} />
          <circle cx="120" cy="96" r="6" fill={INK} />
          <circle cx="82" cy="94" r="2" fill="#fff" />
          <circle cx="122" cy="94" r="2" fill="#fff" />
        </g>
      )}
      {eyes === "happy" && (
        <g stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M72 99 Q80 88 88 99" />
          <path d="M112 99 Q120 88 128 99" />
        </g>
      )}
      {eyes === "scared" && (
        <g>
          <circle cx="80" cy="95" r="10" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <circle cx="120" cy="95" r="10" fill="#fff" stroke={INK} strokeWidth="2.5" />
          <circle cx="80" cy="97" r="4" fill={INK} />
          <circle cx="120" cy="97" r="4" fill={INK} />
        </g>
      )}
      {eyes === "sly" && (
        <g>
          <circle cx="80" cy="97" r="6" fill={INK} />
          <circle cx="120" cy="97" r="6" fill={INK} />
          <path d="M71 97 L89 93 L89 86 L71 86 Z" fill={body} />
          <path d="M111 93 L129 97 L129 86 L111 86 Z" fill={body} />
          <path d="M71 97 L89 93 M111 93 L129 97" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {eyes === "shades" && (
        <g>
          <rect x="64" y="86" width="31" height="18" rx="7" fill="#111" />
          <rect x="105" y="86" width="31" height="18" rx="7" fill="#111" />
          <path d="M95 92 L105 92" stroke="#111" strokeWidth="4" />
          <path d="M70 90 L78 90 M111 90 L119 90" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        </g>
      )}
      {eyes === "visor" && (
        <g>
          <rect x="62" y="84" width="76" height="24" rx="12" fill="#0B1620" stroke="#3DE0E6" strokeWidth="3" />
          <rect x="74" y="92" width="14" height="8" rx="3" fill="#3DE0E6" />
          <rect x="112" y="92" width="14" height="8" rx="3" fill="#3DE0E6" />
        </g>
      )}
      <ellipse cx="100" cy="117" rx="23" ry="15" fill={PAW} />
      <ellipse cx="100" cy="109" rx="11" ry="7.5" fill="#D9636B" />
      <rect x="94.5" y="129" width="5" height="7" rx="1.5" fill="#fff" />
      <rect x="100.5" y="129" width="5" height="7" rx="1.5" fill="#fff" />
      {open ? (
        <g>
          <path d={mood === "laugh" ? "M82 132 Q100 158 118 132 Z" : "M92 136 Q100 148 108 136 Z"} fill="#3A1F1F" />
          <ellipse cx="100" cy={mood === "laugh" ? 145 : 142} rx="6" ry="3.5" fill="#E98B8B" />
        </g>
      ) : (
        <path d={MOUTHS[mood] ?? MOUTHS.wave} stroke="#3A1F1F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}

      {/* hair: a big side-swept fringe from the parting on his left across the forehead */}
      <path d="M42 100 Q36 64 70 58 Q100 50 132 58 Q164 66 160 98 L150 82 Q100 66 50 88 Z" fill={HAIR} />
      <path
        d="M152 74 Q122 56 86 66 Q58 76 50 108 Q62 90 76 84 Q90 80 100 81 Q92 86 90 90 Q110 80 130 79 Q146 79 156 88 Q158 80 152 74 Z"
        fill={HAIR}
      />
      <path d="M144 68 Q118 60 92 70 M132 74 Q110 72 90 80" stroke={HAIR_HI} strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {variant === "zombie" && (
        <g transform="rotate(-16 128 104)">
          <rect x="116" y="100" width="22" height="9" rx="3" fill="#EDE6D0" />
          <path d="M122 102 v5 M127 102 v5 M132 102 v5" stroke="#C9B99A" strokeWidth="1.5" />
        </g>
      )}

      {/* right arm up at the hair, pin brush in paw */}
      <Sleeve pts={[[48, 146], [26, 126], [34, 94]]} side={-1} />
      <g transform="translate(46 60) rotate(20)">
        <PinBrush />
      </g>
      <ellipse cx="34" cy="92" rx="11" ry="9" fill={PAW} />

      {mood === "scared" && (
        <g fill="#8FD3FF">
          <path d="M160 52 Q152 66 160 74 Q168 66 160 52 Z" />
        </g>
      )}
      {(mood === "laugh" || mood === "sad") && (
        <g fill="#8FD3FF">
          <path d="M64 100 Q58 108 62 112 Q68 108 64 100 Z" />
          <path d="M136 100 Q142 108 138 112 Q132 108 136 100 Z" />
        </g>
      )}
      {variant === "alien" && (
        <circle cx="100" cy="112" r="90" fill="#fff" opacity="0.06" stroke="#B6F23A" strokeWidth="3" />
      )}
    </svg>
  );
}
