import { useQuery } from "@tanstack/react-query";
import { parkTypesService } from "@/services/park-types.service";
import type { ParkTypesListParams } from "@/types/park-types.types";

export function useParkTypes(params?: ParkTypesListParams) {
  return useQuery({
    queryKey: ["park-types", params],
    queryFn: () => parkTypesService.list(params),
  });
}
