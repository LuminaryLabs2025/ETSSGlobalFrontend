import { useQuery } from "@tanstack/react-query";
import { facilitiesService } from "@/services/facilities.service";

export function useFacility(id: string | null) {
  return useQuery({
    queryKey: ["facilities", "detail", id],
    queryFn: () => facilitiesService.getById(id!),
    enabled: !!id,
  });
}
