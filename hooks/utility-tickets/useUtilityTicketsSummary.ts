import { useQuery } from "@tanstack/react-query";
import { utilityTicketsService } from "@/services/utility-tickets.service";

export function useUtilityTicketsSummary(enabled = true) {
  return useQuery({
    queryKey: ["utility-tickets", "summary"],
    queryFn: () => utilityTicketsService.summary(),
    enabled,
  });
}
