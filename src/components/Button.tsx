import { ReactNode } from 'react';

/**
 * Two treatments, and the difference is what the button means.
 *
 * `primary` is filled Signal. Signal against Off-White measures 4.48:1, which
 * clears AA for large text and misses AA for body text by a hair, so the label is
 * never set below 19px. That is the same reason the Teaching frames put Signal on
 * a 112px number and nowhere else.
 *
 * `ghost` carries no Signal at all and is what the nav and the secondary actions
 * use, so the filled button stays rare enough to still mean something.
 */
type Props = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  ground?: 'dark' | 'light';
  className?: string;
};

export default function Button({
  href,
  children,
  variant = 'primary',
  ground = 'dark',
  className = '',
}: Props) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap rounded-brand px-6 py-3.5 text-cta font-bold leading-none transition-[background-color,border-color,color,transform] duration-200 ease-state active:scale-[0.97]';

  const styles =
    variant === 'primary'
      ? 'bg-signal text-offwhite hover:brightness-95'
      : ground === 'dark'
        ? 'border border-stone text-offwhite hover:border-offwhite hover:bg-surface'
        : 'border border-slate text-charcoal hover:border-charcoal hover:bg-neutral-100';

  return (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}
