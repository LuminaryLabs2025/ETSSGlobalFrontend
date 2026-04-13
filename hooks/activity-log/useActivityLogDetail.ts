import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "@/services/activity-log.service";

export function useActivityLogDetail(id: string | null) {
  return useQuery({
    queryKey: ["activity-logs", id],
    queryFn: () => activityLogService.getById(id!),
    enabled: !!id,
  });
}
