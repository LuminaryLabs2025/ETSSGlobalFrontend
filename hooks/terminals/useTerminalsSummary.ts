import { useQuery } from "@tanstack/react-query";
import { terminalsService } from "@/services/terminals.service";

export function useTerminalsSummary() {
  return useQuery({
    queryKey: ["terminals", "summary"],
    queryFn: terminalsService.summary,
  });
}
