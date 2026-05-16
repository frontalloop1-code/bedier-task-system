import { initials } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, name, size = 'md', className }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-container-high font-semibold text-primary',
        SIZES[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name || ''} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}
