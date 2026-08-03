import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { infractionCategoriesService } from "@/services/infraction-categories.service";
import type { ApiError } from "@/types/api.types";
import type { InfractionCategoryPayload } from "@/types/infraction-categories.types";

export function useCreateInfractionCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InfractionCategoryPayload) => infractionCategoriesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infraction-categories"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create infraction category");
    },
  });
}

export function useUpdateInfractionCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InfractionCategoryPayload }) =>
      infractionCategoriesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["infraction-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["infraction-categories", "detail", variables.id],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update infraction category");
    },
  });
}

export function useDeleteInfractionCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: infractionCategoriesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infraction-categories"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete infraction category");
    },
  });
}
