import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";

export function useUsersSummary() {
  return useQuery({
    queryKey: ["users", "summary"],
    queryFn: usersService.summary,
  });
}
