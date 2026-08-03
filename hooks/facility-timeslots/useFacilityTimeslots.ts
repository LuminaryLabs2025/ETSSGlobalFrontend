import { useQuery } from "@tanstack/react-query";
import { facilityTimeslotsService } from "@/services/facility-timeslots.service";
import type { FacilityTimeslotsListParams } from "@/types/facility-timeslots.types";

export function useFacilityTimeslots(params?: FacilityTimeslotsListParams) {
  return useQuery({
    queryKey: ["facility-timeslots", params],
    queryFn: () => facilityTimeslotsService.list(params),
  });
}
