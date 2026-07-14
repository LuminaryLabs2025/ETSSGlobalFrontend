import { useQuery } from "@tanstack/react-query";
import { utilityTicketsService } from "@/services/utility-tickets.service";

export function useUtilityTicket(id: string | null) {
  return useQuery({
    queryKey: ["utility-tickets", "detail", id],
    queryFn: () => utilityTicketsService.getById(id!),
    enabled: !!id,
  });
}
