import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "@/services/activity-log.service";
import type { ActivityLogListParams } from "@/types/activity-log.types";

export function useActivityLogs(params?: ActivityLogListParams) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => activityLogService.list(params),
  });
}
