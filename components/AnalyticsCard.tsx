export function AnalyticsCard({
  label,
  value,
}: { label: string; value: string | number | null }) {
  return (
    <div className="border rounded p-4 text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-semibold">{value ?? '—'}</div>
    </div>
  );
}
