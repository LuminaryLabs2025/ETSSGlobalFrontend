import { useQuery } from "@tanstack/react-query";
import { facilityTimeslotsService } from "@/services/facility-timeslots.service";

export function useFacilityTimeslot(id: string | null) {
  return useQuery({
    queryKey: ["facility-timeslots", "detail", id],
    queryFn: () => facilityTimeslotsService.getById(id!),
    enabled: !!id,
  });
}
