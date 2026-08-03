import { useQuery } from "@tanstack/react-query";
import { tepTypesService } from "@/services/tep-types.service";
import type { TepTypesListParams } from "@/types/tep-types.types";

export function useTepTypes(params?: TepTypesListParams) {
  return useQuery({
    queryKey: ["tep-types", params],
    queryFn: () => tepTypesService.list(params),
  });
}
