import React, { useRef, useEffect } from 'react';

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  accentColor = '#38bdf8',
  className = '',
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const pct = ((value - min) / (max - min)) * 100;
      ref.current.style.setProperty('--fill', `${pct}%`);
    }
  }, [value, min, max]);

  return (
    <input
      ref={ref}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-1.5 rounded-full outline-none ${className}`}
      style={{
        background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} var(--fill, 50%), rgba(255,255,255,0.08) var(--fill, 50%), rgba(255,255,255,0.08) 100%)`,
      }}
      {...props}
    />
  );
}