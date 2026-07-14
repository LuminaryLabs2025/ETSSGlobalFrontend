import { useQuery } from "@tanstack/react-query";
import { utilityTicketsService } from "@/services/utility-tickets.service";
import type { UtilityTicketsListParams } from "@/types/utility-tickets.types";

export function useUtilityTickets(params?: UtilityTicketsListParams, enabled = true) {
  return useQuery({
    queryKey: ["utility-tickets", "list", params],
    queryFn: () => utilityTicketsService.list(params),
    enabled,
  });
}
