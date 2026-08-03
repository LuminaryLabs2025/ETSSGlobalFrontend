import { useQuery } from "@tanstack/react-query";
import { paymentTypesService } from "@/services/payment-types.service";

export function usePaymentType(id: string | null) {
  return useQuery({
    queryKey: ["payment-types", "detail", id],
    queryFn: () => paymentTypesService.getById(id!),
    enabled: !!id,
  });
}
