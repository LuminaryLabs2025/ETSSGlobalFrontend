import { useQuery } from "@tanstack/react-query";
import { parkTypesService } from "@/services/park-types.service";

export function useParkType(id: string | null) {
  return useQuery({
    queryKey: ["park-types", "detail", id],
    queryFn: () => parkTypesService.getById(id!),
    enabled: !!id,
  });
}
