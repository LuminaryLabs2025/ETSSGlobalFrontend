import { Suspense } from "react";
import { PaymentCallbackPage } from "@/components/dashboard/PaymentCallbackPage";

export default function PaymentCallback() {
  return (
    <Suspense>
      <PaymentCallbackPage />
    </Suspense>
  );
}
