import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "@/services/activity-log.service";

export function useActivityLogSummary() {
  return useQuery({
    queryKey: ["activity-logs", "summary"],
    queryFn: activityLogService.summary,
  });
}
