import { useQuery } from "@tanstack/react-query";
import { tepTypesService } from "@/services/tep-types.service";

export function useTepType(id: string | null) {
  return useQuery({
    queryKey: ["tep-types", "detail", id],
    queryFn: () => tepTypesService.getById(id!),
    enabled: !!id,
  });
}
