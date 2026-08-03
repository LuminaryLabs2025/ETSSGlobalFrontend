import { useQuery } from "@tanstack/react-query";
import { infractionCategoriesService } from "@/services/infraction-categories.service";

export function useInfractionCategory(id: string | null) {
  return useQuery({
    queryKey: ["infraction-categories", "detail", id],
    queryFn: () => infractionCategoriesService.getById(id!),
    enabled: !!id,
  });
}
