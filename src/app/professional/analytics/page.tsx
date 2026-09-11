export default function ProfessionalAnalyticsPage() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Analytics</h2>
      <p className="text-sm text-muted-foreground">
        Views, enquiries and listing performance will appear here as activity grows.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center">
        <p className="font-medium">Not enough data yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish listings and share them to start collecting metrics.
        </p>
      </div>
    </div>
  );
}
