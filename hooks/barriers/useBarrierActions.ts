import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { barriersService } from "@/services/barriers.service";
import type { ApiError } from "@/types/api.types";
import type { BarrierPayload } from "@/types/barriers.types";

function invalidateBarriers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["barriers"] });
}

export function useCreateBarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BarrierPayload) => barriersService.create(payload),
    onSuccess: () => {
      invalidateBarriers(queryClient);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create barrier");
    },
  });
}

export function useUpdateBarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BarrierPayload }) =>
      barriersService.update(id, payload),
    onSuccess: (_data, variables) => {
      invalidateBarriers(queryClient);
      queryClient.invalidateQueries({ queryKey: ["barriers", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update barrier");
    },
  });
}

export function useDisableBarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: barriersService.disable,
    onSuccess: () => {
      invalidateBarriers(queryClient);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable barrier");
    },
  });
}
