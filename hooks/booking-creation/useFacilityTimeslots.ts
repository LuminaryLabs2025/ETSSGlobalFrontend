import { useQuery } from "@tanstack/react-query";
import { facilitiesService } from "@/services/facilities.service";

export function useFacilityTimeslots(facilityId: string | undefined) {
  return useQuery({
    queryKey: ["facilities", facilityId, "timeslots"],
    queryFn: () => facilitiesService.timeslots(facilityId!, { limit: 100 }),
    enabled: !!facilityId,
  });
}
