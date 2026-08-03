import { useQuery } from "@tanstack/react-query";
import { locationsService } from "@/services/locations.service";
import type { LocationsListParams } from "@/types/locations.types";

export function useLocations(params?: LocationsListParams) {
  return useQuery({
    queryKey: ["locations", params],
    queryFn: () => locationsService.list(params),
  });
}
