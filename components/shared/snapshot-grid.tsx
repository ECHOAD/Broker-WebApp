import { Card, CardContent } from "@/components/ui/card";

type SnapshotMetric = {
  label: string;
  value: string;
};

type SnapshotGridProps = {
  eyebrow?: string;
  metrics: SnapshotMetric[];
};

export function SnapshotGrid({ eyebrow = "Snapshot", metrics }: SnapshotGridProps) {
  return (
    <Card className="admin-card">
      <CardContent className="p-6">
        <p className="eyebrow">{eyebrow}</p>
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <strong style={{ display: "block", fontSize: "1.8rem" }}>{metric.value}</strong>
              <span className="muted">{metric.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
