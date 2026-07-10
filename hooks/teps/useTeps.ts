import { useQuery } from "@tanstack/react-query";
import { tepsService } from "@/services/teps.service";
import type { TEPsListParams } from "@/types/teps.types";

export function useTeps(params?: TEPsListParams) {
  return useQuery({
    queryKey: ["teps", params],
    queryFn: () => tepsService.list(params),
  });
}
