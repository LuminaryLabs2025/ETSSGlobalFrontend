import { useQuery } from "@tanstack/react-query";
import { permissionsService } from "@/services/permissions.service";

export function usePermissionModules() {
  return useQuery({
    queryKey: ["permission-modules"],
    queryFn: permissionsService.modules,
  });
}
