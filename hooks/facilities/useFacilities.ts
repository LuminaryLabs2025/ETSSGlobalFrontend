import { useQuery } from "@tanstack/react-query";
import { facilitiesService } from "@/services/facilities.service";
import type { FacilitiesListParams } from "@/types/facilities.types";

export function useFacilities(params?: FacilitiesListParams) {
  return useQuery({
    queryKey: ["facilities", params],
    queryFn: () => facilitiesService.list(params),
  });
}
