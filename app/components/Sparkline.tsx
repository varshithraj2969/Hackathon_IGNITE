type SparklineProps = {
  points: number[];
  className?: string;
};

export function Sparkline({ points, className }: SparklineProps) {
  const w = 120;
  const h = 34;
  const pad = 2;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1e-6, max - min);

  const d = points
    .map((p, i) => {
      const x = pad + (i * (w - pad * 2)) / (points.length - 1);
      const y = pad + ((max - p) * (h - pad * 2)) / span;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className ?? "h-9 w-28"}
      aria-hidden="true"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

