import { useQuery } from "@tanstack/react-query";
import { locationsService } from "@/services/locations.service";

export function useLocation(id: string | null) {
  return useQuery({
    queryKey: ["locations", "detail", id],
    queryFn: () => locationsService.getById(id!),
    enabled: !!id,
  });
}
