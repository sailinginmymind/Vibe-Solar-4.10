import React from 'react';
import clsx from 'clsx'; // opzionale, se vuoi gestire classi condizionali

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1121]';

  const variants = {
    primary: 'bg-[#38bdf8] text-[#0b1121] hover:bg-[#38bdf8]/90 focus:ring-[#38bdf8]/50',
    secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/30',
    danger: 'bg-[#f43f5e] text-white hover:bg-[#f43f5e]/90 focus:ring-[#f43f5e]/50',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5 focus:ring-white/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className, {
        'opacity-50 cursor-not-allowed': disabled,
      })}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}