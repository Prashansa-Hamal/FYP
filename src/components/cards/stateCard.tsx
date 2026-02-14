export function StatCard({
  title,
  value,
  className = "",
}: {
  title: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border border-gray-200 ${className}`}
    >
      <p className="text-sm mb-1 opacity-80">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
