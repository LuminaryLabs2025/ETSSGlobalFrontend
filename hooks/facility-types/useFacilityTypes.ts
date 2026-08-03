import { useQuery } from "@tanstack/react-query";
import { facilityTypesService } from "@/services/facility-types.service";
import type { FacilityTypesListParams } from "@/types/facility-types.types";

export function useFacilityTypes(params?: FacilityTypesListParams) {
  return useQuery({
    queryKey: ["facility-types", params],
    queryFn: () => facilityTypesService.list(params),
  });
}
