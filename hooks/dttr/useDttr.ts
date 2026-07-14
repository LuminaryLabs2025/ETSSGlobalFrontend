import { useQuery } from "@tanstack/react-query";
import { dttrService } from "@/services/dttr.service";
import type { DTTRListParams } from "@/types/dttr.types";

export function useDttr(params?: DTTRListParams) {
  return useQuery({
    queryKey: ["dttr", "list", params],
    queryFn: () => dttrService.list(params),
  });
}
