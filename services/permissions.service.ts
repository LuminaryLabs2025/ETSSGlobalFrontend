import apiClient from "@/api/client";
import { PERMISSIONS } from "@/api/endpoints";
import type { PermissionModule } from "@/types/permissions.types";

export const permissionsService = {
  modules: async (): Promise<PermissionModule[]> => {
    const { data } = await apiClient.get<PermissionModule[]>(PERMISSIONS.MODULES);
    return data;
  },
};
