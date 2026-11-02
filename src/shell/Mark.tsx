export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`${className} shrink-0 text-primary`} aria-hidden="true">
      <rect x="6" y="18" width="4" height="8" rx="1" fill="currentColor" />
      <rect x="14" y="12" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="22" y="6" width="4" height="20" rx="1" fill="currentColor" />
    </svg>
  );
}
