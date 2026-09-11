import { EmptyState } from '@/components/ui/empty-state';

export default function Page() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Enquiries</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Track enquiries related to your property search
      </p>
      <EmptyState
        title="No enquiries yet"
        description="When you contact an agent from a property page, it will appear here."
        actionLabel="Browse properties"
        actionHref="/search"
      />
    </div>
  );
}
