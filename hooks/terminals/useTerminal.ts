import { useQuery } from "@tanstack/react-query";
import { terminalsService } from "@/services/terminals.service";

export function useTerminal(id: string | null) {
  return useQuery({
    queryKey: ["terminals", "detail", id],
    queryFn: () => terminalsService.getById(id!),
    enabled: !!id,
  });
}
