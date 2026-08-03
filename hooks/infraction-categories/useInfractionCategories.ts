import { useQuery } from "@tanstack/react-query";
import { infractionCategoriesService } from "@/services/infraction-categories.service";
import type { InfractionCategoriesListParams } from "@/types/infraction-categories.types";

export function useInfractionCategories(params?: InfractionCategoriesListParams) {
  return useQuery({
    queryKey: ["infraction-categories", params],
    queryFn: () => infractionCategoriesService.list(params),
  });
}
