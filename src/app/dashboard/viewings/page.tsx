import { EmptyState } from '@/components/ui/empty-state';

export default function Page() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Viewings</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Track viewings related to your property search
      </p>
      <EmptyState
        title="No viewing requests yet"
        description="Request a viewing from any property page to see it listed here."
        actionLabel="Browse properties"
        actionHref="/search"
      />
    </div>
  );
}
