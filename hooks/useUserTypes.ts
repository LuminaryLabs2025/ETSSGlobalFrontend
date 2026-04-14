import { useQuery } from "@tanstack/react-query";
import { userTypesService } from "@/services/user-types.service";
import type { UserTypesListParams } from "@/types/user-types.types";

export function useUserTypes(params?: UserTypesListParams) {
  return useQuery({
    queryKey: ["user-types", params],
    queryFn: () => userTypesService.list(params),
  });
}
