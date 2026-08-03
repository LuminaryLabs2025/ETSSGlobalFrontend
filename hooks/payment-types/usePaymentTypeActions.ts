import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { paymentTypesService } from "@/services/payment-types.service";
import type { ApiError } from "@/types/api.types";
import type { PaymentTypePayload } from "@/types/payment-types.types";

export function useCreatePaymentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentTypePayload) => paymentTypesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to create payment type");
    },
  });
}

export function useUpdatePaymentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PaymentTypePayload }) =>
      paymentTypesService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payment-types"] });
      queryClient.invalidateQueries({ queryKey: ["payment-types", "detail", variables.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update payment type");
    },
  });
}

export function useDeletePaymentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentTypesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-types"] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to delete payment type");
    },
  });
}
