/** The round bunker hatch on the home screen. */
export default function Hatch({ size = 220 }: { size?: number }) {
  const bolts = [
    [206, 110], [178, 178], [110, 206], [42, 178], [14, 110], [42, 42], [110, 14], [178, 42],
  ];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 220 220">
      <circle cx="110" cy="110" r="104" fill="var(--bg-deep)" stroke="var(--border)" strokeWidth="8" />
      {bolts.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="var(--sage)" />
      ))}
      <circle cx="110" cy="110" r="82" fill="var(--surface)" stroke="var(--bg-deep)" strokeWidth="4" />
      <circle cx="110" cy="110" r="42" fill="none" stroke="#9A7E3B" strokeWidth="9" />
      <path d="M68 110 L152 110 M89 74 L131 146 M131 74 L89 146" stroke="#9A7E3B" strokeWidth="7" strokeLinecap="round" />
      <circle cx="110" cy="110" r="12" fill="var(--btn)" />
    </svg>
  );
}
