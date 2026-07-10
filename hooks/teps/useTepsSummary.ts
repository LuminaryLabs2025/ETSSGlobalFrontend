import { useQuery } from "@tanstack/react-query";
import { tepsService } from "@/services/teps.service";

export function useTepsSummary() {
  return useQuery({
    queryKey: ["teps", "summary"],
    queryFn: tepsService.summary,
  });
}
