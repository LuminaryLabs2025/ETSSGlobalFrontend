"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Shield,
  ChevronRight,
  Search,
  ChevronDown,
  CheckCircle2,
  Wallet,
  CreditCard,
  Loader2,
} from "lucide-react";
import {
  BOOK_ASSIST_FEES,
  MOCK_WALLET_BALANCE,
  formatAssistNaira,
} from "@/lib/book-assist-mock-data";

export type BookAssistStep = 1 | 2;
export type PaymentMethod = "wallet" | "paystack";

export interface SelectOption {
  value: string;
  label: string;
}

export interface GroupedSelectOption extends SelectOption {
  group: "mine" | "public";
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onClose]);
}

export function SuperAdminGate({ featureLabel }: { featureLabel: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <Shield className="h-12 w-12 text-amber-400" />
      <h1 className="mt-4 text-lg font-bold text-gray-900">SuperAdmin Access Required</h1>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500">
        {featureLabel} is restricted to SuperAdmin users assisting transporters with booking
        difficulties.
      </p>
    </div>
  );
}

export function BookAssistBreadcrumb({ currentLabel }: { currentLabel: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500">
      <Link href="/dashboard/bookings/all" className="hover:text-gray-700">
        Operations
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/dashboard/bookings/all" className="hover:text-gray-700">
        Bookings
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-gray-800">{currentLabel}</span>
    </nav>
  );
}

export function StepIndicator({ step }: { step: BookAssistStep }) {
  const steps = [
    { num: 1, label: "Booking Details" },
    { num: 2, label: "Preview" },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= s.num ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= s.num ? "text-emerald-700" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-4 h-0.5 w-16 sm:w-24 ${
                step > s.num ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SearchableSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  required,
  disabled,
  searchPlaceholder = "Type to filter…",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setOpen(false);
    setQuery("");
  });

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
            : open
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No matches found</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                      opt.value === value
                        ? "bg-emerald-50 font-medium text-emerald-800"
                        : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SearchableGroupedSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  mineSectionLabel,
  publicSectionLabel,
  required,
  disabled,
  searchPlaceholder = "Type to filter…",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: GroupedSelectOption[];
  mineSectionLabel: string;
  publicSectionLabel: string;
  required?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setOpen(false);
    setQuery("");
  });

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q));
  const mineOptions = filtered.filter((o) => o.group === "mine");
  const publicOptions = filtered.filter((o) => o.group === "public");

  function renderGroup(title: string, items: GroupedSelectOption[]) {
    if (items.length === 0) return null;
    return (
      <>
        <li className="sticky top-0 bg-gray-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {title}
        </li>
        {items.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                setQuery("");
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                opt.value === value ? "bg-emerald-50 font-medium text-emerald-800" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
            : open
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No matches found</li>
            ) : (
              <>
                {renderGroup(mineSectionLabel, mineOptions)}
                {renderGroup(publicSectionLabel, publicOptions)}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PreviewDataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative min-w-[140px] flex-1 border-l-2 border-emerald-500 pl-3 first:border-l-0 first:pl-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function TerminalZoneToggle({
  value,
  onChange,
}: {
  value: "" | "APAPA" | "TINCAN";
  onChange: (zone: "APAPA" | "TINCAN") => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        Select Terminal Location <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        {(["APAPA", "TINCAN"] as const).map((zone) => (
          <button
            key={zone}
            type="button"
            onClick={() => onChange(zone)}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              value === zone
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {zone === "APAPA" ? "Apapa (Port-Terminals)" : "Tincan (Port-Terminals)"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PaymentSummaryPanel({
  detailsConfirmed,
  termsAccepted,
  onTermsChange,
  paymentMethod,
  onPaymentMethodChange,
  onProceedToPay,
  isPaying,
}: {
  detailsConfirmed: boolean;
  termsAccepted: boolean;
  onTermsChange: (v: boolean) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  onProceedToPay: () => void;
  isPaying: boolean;
}) {
  const totalFee =
    BOOK_ASSIST_FEES.booking_fee + BOOK_ASSIST_FEES.taxes + BOOK_ASSIST_FEES.stamp_denotation;

  return (
    <div
      className={`rounded-xl border bg-white p-6 transition-opacity ${
        detailsConfirmed
          ? "border-emerald-200 shadow-sm ring-1 ring-emerald-100"
          : "border-gray-200 opacity-60"
      }`}
    >
      <h2 className="text-sm font-bold text-gray-900">Payment Summary</h2>
      {!detailsConfirmed && (
        <p className="mt-1 text-xs text-amber-600">Confirm booking details to enable payment</p>
      )}

      <div className={`mt-5 space-y-4 ${!detailsConfirmed ? "pointer-events-none" : ""}`}>
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-700">Select Payment Method</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onPaymentMethodChange("wallet")}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                paymentMethod === "wallet"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Wallet className="h-5 w-5 text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Your wallet balance</p>
                <p className="text-xs font-bold text-emerald-600">
                  {formatAssistNaira(MOCK_WALLET_BALANCE)}
                </p>
              </div>
              {paymentMethod === "wallet" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange("paystack")}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                paymentMethod === "paystack"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <CreditCard className="h-5 w-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Paystack</p>
                <p className="text-xs text-gray-500">Pay via card or bank transfer</p>
              </div>
              {paymentMethod === "paystack" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Booking Fee</span>
            <span>{formatAssistNaira(BOOK_ASSIST_FEES.booking_fee)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes</span>
            <span>{formatAssistNaira(BOOK_ASSIST_FEES.taxes)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Stamp Denotation</span>
            <span>{formatAssistNaira(BOOK_ASSIST_FEES.stamp_denotation)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatAssistNaira(totalFee)}</span>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-xs text-gray-600">
            I agree to the{" "}
            <span className="font-semibold text-emerald-700 underline">
              Maritime-ETSS terms and conditions
            </span>
          </span>
        </label>

        <p className="text-[11px] text-gray-400">
          Please confirm your booking details before proceeding to pay
        </p>

        <button
          type="button"
          onClick={onProceedToPay}
          disabled={!detailsConfirmed || !termsAccepted || isPaying}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors ${
            detailsConfirmed && termsAccepted
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          {isPaying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            "Proceed To Pay"
          )}
        </button>
      </div>
    </div>
  );
}
