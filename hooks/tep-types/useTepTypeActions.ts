import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { tepTypesService } from "@/services/tep-types.service";
import type { ApiError } from "@/types/api.types";
import type { TepTypePayload } from "@/types/tep-types.types";

export function useCreateTepType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TepTypePayload) => tepTypesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tep-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create TEP type");
    },
  });
}

export function useUpdateTepType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TepTypePayload }) =>
      tepTypesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tep-types"] });
      queryClient.invalidateQueries({ queryKey: ["tep-types", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update TEP type");
    },
  });
}

export function useDeleteTepType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tepTypesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tep-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete TEP type");
    },
  });
}
