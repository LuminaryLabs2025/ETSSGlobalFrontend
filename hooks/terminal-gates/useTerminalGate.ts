import { useQuery } from "@tanstack/react-query";
import { terminalGatesService } from "@/services/terminal-gates.service";

export function useTerminalGate(id: string | null) {
  return useQuery({
    queryKey: ["terminal-gates", "detail", id],
    queryFn: () => terminalGatesService.getById(id!),
    enabled: !!id,
  });
}
