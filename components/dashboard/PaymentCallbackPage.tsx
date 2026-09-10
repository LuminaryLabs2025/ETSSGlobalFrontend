"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ChevronRight, Loader2, XCircle } from "lucide-react";
import { paymentsService } from "@/services/payments.service";
import { formatAssistNaira } from "@/lib/booking-form-utils";
import { BookingPaymentSuccessModal } from "@/components/dashboard/book-assist/BookAssistUi";
import type { PaymentTransactionResponse } from "@/types/payments.types";

export function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PaymentTransactionResponse | "error" | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!reference) {
      setResult("error");
      return;
    }

    paymentsService
      .verifyByReference(reference)
      .then(setResult)
      .catch(() => setResult("error"));
  }, [searchParams]);

  function handleViewBooking() {
    if (result && result !== "error" && result.payable_id) {
      router.push(`/dashboard/bookings/all?open=${result.payable_id}`);
      return;
    }
    router.push("/dashboard/bookings/all");
  }

  return (
    <div className="space-y-5 p-6">
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/dashboard/bookings/all" className="hover:text-gray-700">
          Bookings
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-gray-800">Payment</span>
      </nav>

      <div className="flex min-h-[50vh] items-center justify-center">
        {result === null && (
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm font-semibold text-gray-900">Verifying payment…</p>
            <p className="mt-1 text-xs text-gray-500">Please wait while we confirm with Paystack</p>
          </div>
        )}

        {result === "error" && (
          <div className="mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">Payment Not Found</h3>
            <p className="mt-2 text-sm text-gray-600">
              We couldn&apos;t verify this payment. If you were charged, contact support with your
              transaction reference.
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard/bookings/all")}
              className="mt-6 w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Back to Bookings
            </button>
          </div>
        )}

        {result !== null && result !== "error" && result.status === "SUCCESSFUL" && (
          <BookingPaymentSuccessModal
            asPage
            message="Your booking payment has been confirmed."
            invoiceNumber={result.invoice_number}
            onContinue={handleViewBooking}
            continueLabel={result.payable_id ? "View Booking" : "View All Bookings"}
          />
        )}

        {result !== null && result !== "error" && result.status !== "SUCCESSFUL" && (
          <div className="mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <XCircle className="h-8 w-8 text-amber-700" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">Payment Unsuccessful</h3>
            <p className="mt-2 text-sm text-gray-600">
              {result.gateway_response ?? "The payment was not completed."}
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-left text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</p>
              <p className="mt-0.5 font-semibold text-gray-900">{result.status}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</p>
              <p className="mt-0.5 font-semibold text-gray-900">
                {formatAssistNaira(result.amount)} {result.currency}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Reference</p>
              <p className="mt-0.5 font-mono text-xs text-gray-700">{result.reference}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/bookings/all")}
              className="mt-6 w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Back to Bookings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
