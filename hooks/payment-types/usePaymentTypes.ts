import { useQuery } from "@tanstack/react-query";
import { paymentTypesService } from "@/services/payment-types.service";
import type { PaymentTypesListParams } from "@/types/payment-types.types";

export function usePaymentTypes(params?: PaymentTypesListParams) {
  return useQuery({
    queryKey: ["payment-types", params],
    queryFn: () => paymentTypesService.list(params),
  });
}
