interface ScrubberProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  formatLabel?: (v: number) => string;
  formatValue?: (v: number) => string;
}

export function Scrubber({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (v) => `t = ${v}h`,
  formatValue = (v) => `${v}h`,
}: ScrubberProps) {
  return (
    <div className="scrubber">
      <span className="scrubber__label">{formatLabel(value)}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Drift time scrubber"
      />
      <span className="scrubber__value">{formatValue(value)}</span>
    </div>
  );
}
