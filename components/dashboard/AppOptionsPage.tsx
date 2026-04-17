"use client";

import { useState } from "react";
import {
  Settings,
  Search,
  Truck,
  Ruler,
  BookOpen,
  FileCheck,
  ParkingCircle,
  Warehouse,
  Clock,
  MapPin,
  CreditCard,
  AlertTriangle,
  DoorOpen,
  Smartphone,
  Radio,
  ChevronRight,
  X,
  Hash,
  CheckCircle2,
  XCircle,
  Shield,
  Layers,
} from "lucide-react";

// ─── Types ───
interface OptionItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

interface OptionCategory {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  items: OptionItem[];
}

// ─── Mock Data ───
const MOCK_OPTIONS: OptionCategory[] = [
  {
    key: "truck-types",
    label: "Truck Types",
    icon: Truck,
    description: "Types of trucks registered on the platform",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    items: [
      { id: "tt-1", name: "Flatbed Truck", slug: "flatbed", description: "Open flat trailer for general cargo", is_active: true },
      { id: "tt-2", name: "Container Truck", slug: "container", description: "Standard container hauler", is_active: true },
      { id: "tt-3", name: "Tanker Truck", slug: "tanker", description: "Liquid cargo transport vehicle", is_active: true },
      { id: "tt-4", name: "Tipper Truck", slug: "tipper", description: "Hydraulic dump truck for bulk goods", is_active: true },
      { id: "tt-5", name: "Low Bed Truck", slug: "low-bed", description: "Heavy equipment transporter", is_active: false },
      { id: "tt-6", name: "Fish-Van Truck", slug: "fish-van", description: "Refrigerated van for perishable goods", is_active: true },
    ],
  },
  {
    key: "truck-capabilities",
    label: "Truck Capabilities",
    icon: Shield,
    description: "Operational capabilities assigned to trucks",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    items: [
      { id: "tc-1", name: "Hazmat Certified", slug: "hazmat", description: "Licensed to transport hazardous materials", is_active: true },
      { id: "tc-2", name: "Oversized Load", slug: "oversized", description: "Permitted for oversized cargo", is_active: true },
      { id: "tc-3", name: "Refrigerated", slug: "refrigerated", description: "Temperature-controlled transport", is_active: true },
      { id: "tc-4", name: "GPS Tracked", slug: "gps-tracked", description: "Real-time GPS monitoring enabled", is_active: true },
      { id: "tc-5", name: "RFID Enabled", slug: "rfid-enabled", description: "Supports RFID tag identification", is_active: true },
    ],
  },
  {
    key: "truck-lengths",
    label: "Truck Lengths",
    icon: Ruler,
    description: "Standard truck length classifications",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    items: [
      { id: "tl-1", name: "20ft", slug: "20ft", description: "20-foot standard trailer", is_active: true },
      { id: "tl-2", name: "40ft", slug: "40ft", description: "40-foot standard trailer", is_active: true },
      { id: "tl-3", name: "45ft", slug: "45ft", description: "45-foot extended trailer", is_active: true },
      { id: "tl-4", name: "48ft", slug: "48ft", description: "48-foot high-capacity trailer", is_active: false },
      { id: "tl-5", name: "53ft", slug: "53ft", description: "53-foot maximum length trailer", is_active: false },
    ],
  },
  {
    key: "booking-categories",
    label: "Booking Categories",
    icon: BookOpen,
    description: "Categories for booking classification",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    items: [
      { id: "bc-1", name: "Import (Laden)", slug: "import-laden", description: "Import of loaded containers", is_active: true },
      { id: "bc-2", name: "Import (Empty)", slug: "import-empty", description: "Return of empty import containers", is_active: true },
      { id: "bc-3", name: "Export (Laden)", slug: "export-laden", description: "Export of loaded containers", is_active: true },
      { id: "bc-4", name: "Export (Empty)", slug: "export-empty", description: "Pickup of empty export containers", is_active: true },
      { id: "bc-5", name: "Transfer", slug: "transfer", description: "Inter-terminal container transfer", is_active: true },
      { id: "bc-6", name: "Transit", slug: "transit", description: "Transit through port area", is_active: true },
    ],
  },
  {
    key: "tep-types",
    label: "TEP Types",
    icon: FileCheck,
    description: "Truck Entry Permit type classifications",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    items: [
      { id: "tep-1", name: "Standard TEP", slug: "standard", description: "Regular port access permit", is_active: true },
      { id: "tep-2", name: "Emergency TEP", slug: "emergency", description: "Fast-tracked emergency access permit", is_active: true },
      { id: "tep-3", name: "VIP TEP", slug: "vip", description: "Priority access for designated trucks", is_active: true },
      { id: "tep-4", name: "Temporary TEP", slug: "temporary", description: "Short-duration temporary access", is_active: false },
    ],
  },
  {
    key: "park-types",
    label: "Park Types",
    icon: ParkingCircle,
    description: "Classifications for transit and truck parks",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    items: [
      { id: "pt-1", name: "Pre-Gate Park", slug: "pre-gate", description: "Staging area before terminal gate", is_active: true },
      { id: "pt-2", name: "Transit Park", slug: "transit", description: "General transit holding area", is_active: true },
      { id: "pt-3", name: "Empties Park", slug: "empties", description: "Dedicated park for empty containers", is_active: true },
      { id: "pt-4", name: "Fish-Van Park", slug: "fish-van", description: "Specialized park for fish-van trucks", is_active: true },
      { id: "pt-5", name: "Bonded Park", slug: "bonded", description: "Customs-bonded parking facility", is_active: false },
    ],
  },
  {
    key: "facility-types",
    label: "Facility Types",
    icon: Warehouse,
    description: "Types of operational facilities",
    color: "text-violet-600 bg-violet-50 border-violet-200",
    items: [
      { id: "ft-1", name: "Bonded Terminal", slug: "bonded-terminal", description: "Customs-bonded container terminal", is_active: true },
      { id: "ft-2", name: "Bonded Warehouse", slug: "bonded-warehouse", description: "Customs-bonded storage facility", is_active: true },
      { id: "ft-3", name: "Free Zone", slug: "free-zone", description: "Export processing / free trade zone", is_active: true },
      { id: "ft-4", name: "Container Freight Station", slug: "cfs", description: "Container stuffing/unstuffing facility", is_active: true },
    ],
  },
  {
    key: "facility-timeslots",
    label: "Facility Timeslots",
    icon: Clock,
    description: "Operating time windows for facility access",
    color: "text-teal-600 bg-teal-50 border-teal-200",
    items: [
      { id: "fts-1", name: "Morning Shift (06:00–12:00)", slug: "morning", description: "First operating window", is_active: true },
      { id: "fts-2", name: "Afternoon Shift (12:00–18:00)", slug: "afternoon", description: "Second operating window", is_active: true },
      { id: "fts-3", name: "Night Shift (18:00–06:00)", slug: "night", description: "Overnight operating window", is_active: true },
      { id: "fts-4", name: "24-Hour Window", slug: "24hr", description: "Full day unrestricted access", is_active: true },
    ],
  },
  {
    key: "locations",
    label: "Locations",
    icon: MapPin,
    description: "Geographic locations and zones",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    items: [
      { id: "loc-1", name: "Apapa Port Complex", slug: "apapa", description: "Apapa Wharf and surrounding terminals", is_active: true },
      { id: "loc-2", name: "Tin Can Island", slug: "tincan", description: "Tin Can Island port complex", is_active: true },
      { id: "loc-3", name: "Onne Port", slug: "onne", description: "Federal Ocean Terminal, Onne", is_active: true },
      { id: "loc-4", name: "Lekki Deep Sea Port", slug: "lekki", description: "Lekki Free Trade Zone port", is_active: true },
      { id: "loc-5", name: "Calabar Port", slug: "calabar", description: "Calabar port and EPZ", is_active: false },
      { id: "loc-6", name: "Warri Port", slug: "warri", description: "Delta Ports, Warri", is_active: false },
    ],
  },
  {
    key: "payment-types",
    label: "Payment Types",
    icon: CreditCard,
    description: "Accepted payment methods on the platform",
    color: "text-green-600 bg-green-50 border-green-200",
    items: [
      { id: "pay-1", name: "Bank Transfer", slug: "bank-transfer", description: "Direct bank-to-bank transfer", is_active: true },
      { id: "pay-2", name: "Card Payment", slug: "card", description: "Debit/credit card payment", is_active: true },
      { id: "pay-3", name: "USSD", slug: "ussd", description: "USSD mobile payment", is_active: true },
      { id: "pay-4", name: "Wallet", slug: "wallet", description: "Platform wallet balance", is_active: true },
      { id: "pay-5", name: "Cash (On-Site)", slug: "cash", description: "Cash payment at facility", is_active: false },
    ],
  },
  {
    key: "infraction-categories",
    label: "Infraction Categories",
    icon: AlertTriangle,
    description: "Categories of violations and infractions",
    color: "text-red-600 bg-red-50 border-red-200",
    items: [
      { id: "inf-1", name: "Unauthorized Entry", slug: "unauthorized-entry", description: "Entering restricted zone without permit", is_active: true },
      { id: "inf-2", name: "Overstay", slug: "overstay", description: "Exceeding allocated time window", is_active: true },
      { id: "inf-3", name: "Wrong Route", slug: "wrong-route", description: "Deviation from designated route", is_active: true },
      { id: "inf-4", name: "Documentation Failure", slug: "doc-failure", description: "Missing or invalid documentation", is_active: true },
      { id: "inf-5", name: "Safety Violation", slug: "safety-violation", description: "Non-compliance with safety rules", is_active: true },
      { id: "inf-6", name: "Overloading", slug: "overloading", description: "Exceeding weight or size limits", is_active: true },
    ],
  },
  {
    key: "terminal-gates",
    label: "Terminal Gates",
    icon: DoorOpen,
    description: "Entry and exit gate configurations",
    color: "text-slate-600 bg-slate-50 border-slate-200",
    items: [
      { id: "tg-1", name: "Gate 1 – APM Terminals", slug: "apm-gate-1", description: "Primary entry gate for APM Terminals", is_active: true },
      { id: "tg-2", name: "Gate 2 – APM Terminals", slug: "apm-gate-2", description: "Secondary exit gate for APM Terminals", is_active: true },
      { id: "tg-3", name: "Gate A – Tincan", slug: "tincan-gate-a", description: "Main entry gate Tin Can Island", is_active: true },
      { id: "tg-4", name: "Gate B – Tincan", slug: "tincan-gate-b", description: "Exit gate Tin Can Island", is_active: true },
      { id: "tg-5", name: "Gate 1 – PTML", slug: "ptml-gate-1", description: "PTML terminal access gate", is_active: true },
      { id: "tg-6", name: "Gate 1 – Grimaldi", slug: "grimaldi-gate-1", description: "Grimaldi terminal access gate", is_active: false },
    ],
  },
  {
    key: "handheld-devices",
    label: "Handheld Devices",
    icon: Smartphone,
    description: "Registered mobile scanning devices",
    color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
    items: [
      { id: "hd-1", name: "HH-APM-001", slug: "hh-apm-001", description: "APM Terminal Gate 1 — Zebra TC52", is_active: true },
      { id: "hd-2", name: "HH-APM-002", slug: "hh-apm-002", description: "APM Terminal Gate 2 — Zebra TC52", is_active: true },
      { id: "hd-3", name: "HH-TIN-001", slug: "hh-tin-001", description: "Tin Can Gate A — Honeywell CT60", is_active: true },
      { id: "hd-4", name: "HH-TIN-002", slug: "hh-tin-002", description: "Tin Can Gate B — Honeywell CT60", is_active: false },
      { id: "hd-5", name: "HH-PTML-001", slug: "hh-ptml-001", description: "PTML Gate 1 — Zebra TC72", is_active: true },
    ],
  },
  {
    key: "rfid-tags",
    label: "RFID Tags",
    icon: Radio,
    description: "RFID tag inventory and assignment status",
    color: "text-sky-600 bg-sky-50 border-sky-200",
    items: [
      { id: "rf-1", name: "RFID-00001", slug: "rfid-00001", description: "Assigned to Truck LND-234-XY", is_active: true },
      { id: "rf-2", name: "RFID-00002", slug: "rfid-00002", description: "Assigned to Truck APP-891-KJ", is_active: true },
      { id: "rf-3", name: "RFID-00003", slug: "rfid-00003", description: "Unassigned — Available", is_active: true },
      { id: "rf-4", name: "RFID-00004", slug: "rfid-00004", description: "Assigned to Truck MUS-102-AB", is_active: true },
      { id: "rf-5", name: "RFID-00005", slug: "rfid-00005", description: "Deactivated — Lost", is_active: false },
      { id: "rf-6", name: "RFID-00006", slug: "rfid-00006", description: "Unassigned — Available", is_active: true },
    ],
  },
];

// ─── Status Badge ───
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
      <CheckCircle2 className="h-3 w-3" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
      <XCircle className="h-3 w-3" />
      Inactive
    </span>
  );
}

// ─── Category Card ───
function CategoryCard({
  category,
  isSelected,
  onSelect,
}: {
  category: OptionCategory;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = category.icon;
  const activeCount = category.items.filter((i) => i.is_active).length;
  const totalCount = category.items.length;
  const colorClasses = category.color.split(" ");
  const textColor = colorClasses[0];
  const bgColor = colorClasses[1];

  return (
    <button
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
        isSelected
          ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className={`shrink-0 rounded-lg p-2 ${bgColor}`}>
        <Icon className={`h-4.5 w-4.5 ${textColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold truncate ${isSelected ? "text-emerald-900" : "text-gray-900"}`}>
          {category.label}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="font-medium text-gray-600">{activeCount}</span>
          <span>/</span>
          <span>{totalCount}</span>
          <span>active</span>
        </p>
      </div>
      <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? "text-emerald-500" : "text-gray-300 group-hover:text-gray-400"}`} />
    </button>
  );
}

// ─── Detail Panel ───
function DetailPanel({
  category,
  search,
}: {
  category: OptionCategory;
  search: string;
}) {
  const Icon = category.icon;
  const colorClasses = category.color.split(" ");
  const textColor = colorClasses[0];
  const bgColor = colorClasses[1];

  const filtered = category.items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = category.items.filter((i) => i.is_active).length;
  const inactiveCount = category.items.length - activeCount;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <div className={`rounded-lg p-2.5 ${bgColor}`}>
          <Icon className={`h-5 w-5 ${textColor}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-gray-900">{category.label}</h2>
          <p className="text-xs text-gray-500">{category.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            {activeCount} Active
          </span>
          {inactiveCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
              {inactiveCount} Inactive
            </span>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3 w-3" />
                  Name
                </div>
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Slug</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Description</th>
              <th className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-400">No items match your search</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                  <td className="px-5 py-3">
                    <p className="text-xs font-medium text-gray-900">{item.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                      {item.slug ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs text-gray-500 max-w-xs truncate">{item.description ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge active={item.is_active} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{filtered.length}</span> of{" "}
          <span className="font-medium text-gray-700">{category.items.length}</span> items
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───
export function AppOptionsPage() {
  const [selectedKey, setSelectedKey] = useState<string>(MOCK_OPTIONS[0].key);
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const selectedCategory = MOCK_OPTIONS.find((c) => c.key === selectedKey) ?? MOCK_OPTIONS[0];

  const filteredCategories = MOCK_OPTIONS.filter(
    (c) =>
      c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.description.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const totalItems = MOCK_OPTIONS.reduce((sum, c) => sum + c.items.length, 0);
  const totalActive = MOCK_OPTIONS.reduce((sum, c) => sum + c.items.filter((i) => i.is_active).length, 0);

  return (
    <div className="p-6 space-y-5">
      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-[#0f1e2e] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">App Options</h1>
            <p className="text-xs text-gray-400">
              Platform configuration values and system-wide option sets
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <Settings className="h-3 w-3" />
            Configuration
          </span>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-blue-400/10 p-1.5">
                <Layers className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{MOCK_OPTIONS.length}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">Categories</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-violet-400/10 p-1.5">
                <Hash className="h-4 w-4 text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalItems}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">Total Options</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-400/10 p-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalActive}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">Active</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-red-400/10 p-1.5">
                <XCircle className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalItems - totalActive}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">Inactive</p>
          </div>
        </div>
      </div>

      {/* ─── Content Grid ─── */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Left: Category List (2/5) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="sticky top-20 space-y-3">
            {/* Category Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />
              {categorySearch && (
                <button
                  onClick={() => setCategorySearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Cards */}
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredCategories.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                  <Search className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-400">No categories found</p>
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <CategoryCard
                    key={cat.key}
                    category={cat}
                    isSelected={selectedKey === cat.key}
                    onSelect={() => {
                      setSelectedKey(cat.key);
                      setSearch("");
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Detail Panel (3/5) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Item Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${selectedCategory.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Detail */}
          <DetailPanel category={selectedCategory} search={search} />
        </div>
      </div>

      {/* ─── Info Notice ─── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          <span className="font-semibold">Read-Only View:</span> These configuration values are managed by the
          backend system. Changes to app options must be made through the server administration panel or API. Contact
          your system administrator for modifications.
        </p>
      </div>
    </div>
  );
}
