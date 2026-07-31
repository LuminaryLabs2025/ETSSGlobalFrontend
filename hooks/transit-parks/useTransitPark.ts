import { useQuery } from "@tanstack/react-query";
import { transitParksService } from "@/services/transit-parks.service";

export function useTransitPark(id: string | null) {
  return useQuery({
    queryKey: ["transit-parks", "detail", id],
    queryFn: () => transitParksService.getById(id!),
    enabled: !!id,
  });
}
