export default function ProfessionalViewingsPage() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Viewings</h2>
      <p className="text-sm text-muted-foreground">
        Viewing requests for your properties.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center">
        <p className="font-medium">No viewing requests</p>
      </div>
    </div>
  );
}
