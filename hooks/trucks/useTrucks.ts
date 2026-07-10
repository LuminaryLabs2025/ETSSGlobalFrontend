import { useQuery } from "@tanstack/react-query";
import { trucksService } from "@/services/trucks.service";
import type { TrucksListParams } from "@/types/trucks.types";

export function useTrucks(params?: TrucksListParams) {
  return useQuery({
    queryKey: ["trucks", params],
    queryFn: () => trucksService.list(params),
  });
}
