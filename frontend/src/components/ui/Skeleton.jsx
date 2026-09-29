export function SkeletonLine({ width = '100%', height = '0.9rem', className = '' }) {
  return <div className={`skeleton rounded ${className}`} style={{ width, height }} />;
}

export function SkeletonBlock({ height = '5rem', className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} style={{ height }} />;
}

/** Generic page-loading skeleton mimicking a headline + a few content blocks. */
export default function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 max-w-md">
        <SkeletonLine width="30%" height="0.7rem" />
        <SkeletonLine width="70%" height="2.5rem" />
      </div>
      <SkeletonBlock height="7rem" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonBlock height="6rem" />
        <SkeletonBlock height="6rem" />
        <SkeletonBlock height="6rem" />
      </div>
    </div>
  );
}
