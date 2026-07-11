import React from 'react';

export default function Card({
  children,
  className = '',
  variant = 'default', // 'default' | 'accent' | 'gold'
  ...props
}) {
  const variants = {
    default: 'glass',
    accent: 'glass-accent',
    gold: 'glass-gold',
  };

  return (
    <div className={`${variants[variant]} rounded-2xl p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}