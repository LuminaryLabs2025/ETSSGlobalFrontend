import { useMutation, useQueryClient } from "@tanstack/react-query";
import { terminalsService } from "@/services/terminals.service";
import { toast } from "sonner";
import type { ApiError } from "@/types/api.types";
import type { Terminal, UpdateTerminalPayload, EditTerminalInformationPayload } from "@/types/terminals.types";
import { AxiosError } from "axios";

function invalidateTerminals(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["terminals"] });
}

export function useUpdateTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTerminalPayload }) =>
      terminalsService.update(id, payload),
    onSuccess: () => invalidateTerminals(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update terminal");
    },
  });
}

export function useEnableTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (terminal: Terminal) => {
      if (terminal.archived_at) {
        return terminalsService.unarchive(terminal.id);
      }
      return terminalsService.enable(terminal.id);
    },
    onSuccess: () => invalidateTerminals(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to enable terminal");
    },
  });
}

export function useDisableTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (terminal: Terminal) => terminalsService.disable(terminal.id),
    onSuccess: () => invalidateTerminals(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to disable terminal");
    },
  });
}

export function useArchiveTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: terminalsService.archive,
    onSuccess: () => invalidateTerminals(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to archive terminal");
    },
  });
}

export function useUnarchiveTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: terminalsService.unarchive,
    onSuccess: () => invalidateTerminals(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to unarchive terminal");
    },
  });
}

export function useEditTerminalInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id: _id,
      payload: _payload,
    }: {
      id: string;
      payload: EditTerminalInformationPayload;
    }) => {
      // Mock until dedicated edit-information endpoint is available.
      await new Promise((resolve) => setTimeout(resolve, 700));
      return { message: "Terminal information updated successfully." };
    },
    onSuccess: (response) => {
      invalidateTerminals(queryClient);
      toast.success(response.message);
    },
    onError: () => {
      toast.error("Failed to update terminal information");
    },
  });
}

export function useDeleteTerminal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: terminalsService.delete,
    onSuccess: () => invalidateTerminals(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete terminal");
    },
  });
}
