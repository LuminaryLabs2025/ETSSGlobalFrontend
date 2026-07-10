import { useQuery } from "@tanstack/react-query";
import { driversService } from "@/services/drivers.service";

export function useDriversSummary() {
  return useQuery({
    queryKey: ["drivers", "summary"],
    queryFn: driversService.summary,
  });
}
