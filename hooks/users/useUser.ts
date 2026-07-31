import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";

export function useUser(id: string | null) {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
  });
}
