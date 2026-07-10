import { useQuery } from "@tanstack/react-query";
import { driversService } from "@/services/drivers.service";
import type { DriversListParams } from "@/types/drivers.types";

export function useDrivers(params?: DriversListParams) {
  return useQuery({
    queryKey: ["drivers", params],
    queryFn: () => driversService.list(params),
  });
}
