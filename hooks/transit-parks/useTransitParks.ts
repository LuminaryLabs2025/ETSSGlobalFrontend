import { useQuery } from "@tanstack/react-query";
import { transitParksService } from "@/services/transit-parks.service";
import type { TransitParksListParams } from "@/types/transit-parks.types";

export function useTransitParks(params?: TransitParksListParams) {
  return useQuery({
    queryKey: ["transit-parks", params],
    queryFn: () => transitParksService.list(params),
  });
}
