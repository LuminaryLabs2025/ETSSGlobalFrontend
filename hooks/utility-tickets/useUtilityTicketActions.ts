import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { utilityTicketsService } from "@/services/utility-tickets.service";
import type { ApiError } from "@/types/api.types";
import type {
  EditUtilityTicketPayload,
  GenerateUtilityTicketPayload,
  UtilityTicketsListParams,
} from "@/types/utility-tickets.types";

function invalidateUtilityTickets(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["utility-tickets"] });
}

export function useGenerateUtilityTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateUtilityTicketPayload) => utilityTicketsService.generate(payload),
    onSuccess: () => invalidateUtilityTickets(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to generate utility ticket");
    },
  });
}

export function useEditUtilityTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditUtilityTicketPayload }) =>
      utilityTicketsService.edit(id, payload),
    onSuccess: () => invalidateUtilityTickets(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update utility ticket");
    },
  });
}

export function useApproveUtilityTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => utilityTicketsService.approve(id),
    onSuccess: () => invalidateUtilityTickets(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to approve utility ticket");
    },
  });
}

export function useCancelUtilityTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => utilityTicketsService.cancel(id),
    onSuccess: () => invalidateUtilityTickets(queryClient),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to cancel utility ticket");
    },
  });
}

export function useExportUtilityTickets() {
  return useMutation({
    mutationFn: (params?: UtilityTicketsListParams) => utilityTicketsService.exportCsv(params),
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to export utility tickets");
    },
  });
}

export function useDownloadUtilityETicket() {
  return useMutation({
    mutationFn: async (id: string) => {
      const ticket = await utilityTicketsService.getETicket(id);
      const blob = new Blob([JSON.stringify(ticket, null, 2)], { type: "application/json;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `e-utility-ticket-${ticket.ticket_id}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return ticket;
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to download e-ticket");
    },
  });
}
