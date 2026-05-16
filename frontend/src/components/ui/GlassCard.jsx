import { cn } from '../../lib/cn.js';

export function GlassCard({ as: Tag = 'div', className, children, accent, ...rest }) {
  const accentClass = accent
    ? {
        primary: 'before:bg-primary',
        secondary: 'before:bg-secondary',
        tertiary: 'before:bg-tertiary',
        success: 'before:bg-success',
        error: 'before:bg-error',
      }[accent] || ''
    : '';

  return (
    <Tag
      className={cn(
        'relative glass rounded-xl p-5',
        accent && `before:absolute before:left-0 before:top-3 before:h-[calc(100%-24px)] before:w-[2px] before:rounded-full ${accentClass}`,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
