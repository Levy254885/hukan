export default function ProfessionalLeadsPage() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Leads</h2>
      <p className="text-sm text-muted-foreground">
        Enquiries and viewing requests for your listings will appear here.
      </p>
      <div className="mt-6 rounded-lg border border-dashed border-border p-10 text-center">
        <p className="font-medium">No leads yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish listings to start receiving enquiries.
        </p>
      </div>
    </div>
  );
}
