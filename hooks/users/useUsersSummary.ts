import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import type { UsersSummaryParams } from "@/types/users.types";

export function useUsersSummary(params?: UsersSummaryParams) {
  return useQuery({
    queryKey: ["users", "summary", params],
    queryFn: () => usersService.summary(params),
  });
}
