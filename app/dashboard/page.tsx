import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { OverviewAccessGate } from "@/components/dashboard/overview/OverviewAccessGate";

export default function DashboardPage() {
  return (
    <OverviewAccessGate>
      <DashboardOverview />
    </OverviewAccessGate>
  );
}
