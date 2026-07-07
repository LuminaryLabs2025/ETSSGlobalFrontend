import { useQuery } from "@tanstack/react-query";
import { terminalsService } from "@/services/terminals.service";
import type { TerminalsListParams } from "@/types/terminals.types";

export function useTerminals(params?: TerminalsListParams) {
  return useQuery({
    queryKey: ["terminals", params],
    queryFn: () => terminalsService.list(params),
  });
}
