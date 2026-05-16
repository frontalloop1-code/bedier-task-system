import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

export function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return format(dt, 'MMM d, yyyy');
}

export function fmtDateTime(d) {
  if (!d) return '';
  return format(new Date(d), 'MMM d, h:mm a');
}

export function fmtDueLabel(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isToday(dt)) return `Today · ${format(dt, 'h:mm a')}`;
  if (isTomorrow(dt)) return `Tomorrow · ${format(dt, 'h:mm a')}`;
  if (isPast(dt)) return `Overdue · ${formatDistanceToNow(dt, { addSuffix: true })}`;
  return format(dt, 'EEE, MMM d');
}

export function fmtAgo(d) {
  if (!d) return '';
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

export function initials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
