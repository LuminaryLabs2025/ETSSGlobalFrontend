import { useQuery } from "@tanstack/react-query";
import { terminalGatesService } from "@/services/terminal-gates.service";
import type { TerminalGatesListParams } from "@/types/terminal-gates.types";

export function useTerminalGates(params?: TerminalGatesListParams) {
  return useQuery({
    queryKey: ["terminal-gates", params],
    queryFn: () => terminalGatesService.list(params),
  });
}
