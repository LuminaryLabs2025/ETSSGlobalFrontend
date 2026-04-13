import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import type { UsersListParams } from "@/types/users.types";

export function useUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersService.list(params),
  });
}
