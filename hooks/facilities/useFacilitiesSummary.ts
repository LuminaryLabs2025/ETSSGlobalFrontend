import { useQuery } from "@tanstack/react-query";
import { facilitiesService } from "@/services/facilities.service";

export function useFacilitiesSummary() {
  return useQuery({
    queryKey: ["facilities", "summary"],
    queryFn: facilitiesService.summary,
  });
}
