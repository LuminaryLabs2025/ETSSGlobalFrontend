import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { terminalGatesService } from "@/services/terminal-gates.service";
import type { ApiError } from "@/types/api.types";
import type { TerminalGatePayload } from "@/types/terminal-gates.types";

export function useCreateTerminalGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TerminalGatePayload) => terminalGatesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminal-gates"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create terminal gate");
    },
  });
}

export function useUpdateTerminalGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TerminalGatePayload }) =>
      terminalGatesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["terminal-gates"] });
      queryClient.invalidateQueries({ queryKey: ["terminal-gates", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update terminal gate");
    },
  });
}

export function useDeleteTerminalGate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: terminalGatesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminal-gates"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete terminal gate");
    },
  });
}
