import { useQuery } from "@tanstack/react-query";
import { trucksService } from "@/services/trucks.service";

export function useTrucksSummary() {
  return useQuery({
    queryKey: ["trucks", "summary"],
    queryFn: trucksService.summary,
  });
}
