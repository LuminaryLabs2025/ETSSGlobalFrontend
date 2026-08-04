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
  DoorOpen,
  Smartphone,
  Radio,
  ChevronRight,
  X,
  Hash,
  CheckCircle2,
  XCircle,
  Layers,
  Gauge,
} from "lucide-react";
import { PaymentTypesPanel, usePaymentTypesCount } from "@/components/dashboard/app-options/PaymentTypesPanel";
import {
  FacilityTimeslotsPanel,
  useFacilityTimeslotsCount,
} from "@/components/dashboard/app-options/FacilityTimeslotsPanel";
import { TruckTypesPanel, useTruckTypesCount } from "@/components/dashboard/app-options/TruckTypesPanel";
import {
  TruckCapacitiesPanel,
  useTruckCapacitiesCount,
} from "@/components/dashboard/app-options/TruckCapacitiesPanel";
import {
  TruckLengthsPanel,
  useTruckLengthsCount,
} from "@/components/dashboard/app-options/TruckLengthsPanel";
import {
  BookingCategoriesPanel,
  useBookingCategoriesCount,
} from "@/components/dashboard/app-options/BookingCategoriesPanel";
import { TepTypesPanel, useTepTypesCount } from "@/components/dashboard/app-options/TepTypesPanel";
import { ParkTypesPanel, useParkTypesCount } from "@/components/dashboard/app-options/ParkTypesPanel";
import {
  FacilityTypesPanel,
  useFacilityTypesCount,
} from "@/components/dashboard/app-options/FacilityTypesPanel";
import { LocationsPanel, useLocationsCount } from "@/components/dashboard/app-options/LocationsPanel";
import {
  TerminalGatesPanel,
  useTerminalGatesCount,
} from "@/components/dashboard/app-options/TerminalGatesPanel";
import {
  HandheldDevicesPanel,
  useHandheldDevicesCount,
} from "@/components/dashboard/app-options/HandheldDevicesPanel";
import { RfidTagsPanel, useRfidTagsCount } from "@/components/dashboard/app-options/RfidTagsPanel";

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
  isLive?: boolean;
}

// ─── Mock Data ───
const MOCK_OPTIONS: OptionCategory[] = [
  {
    key: "truck-types",
    label: "Truck Types",
    icon: Truck,
    description: "Truck type classifications registered on the platform",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    isLive: true,
    items: [],
  },
  {
    key: "truck-capacities",
    label: "Truck Capacity",
    icon: Gauge,
    description: "Capacity values linked to truck types",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    isLive: true,
    items: [],
  },
  {
    key: "truck-lengths",
    label: "Truck Lengths",
    icon: Ruler,
    description: "Length values linked to truck types",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    isLive: true,
    items: [],
  },
  {
    key: "booking-categories",
    label: "Booking Categories",
    icon: BookOpen,
    description: "Booking classifications for operational categorization",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    isLive: true,
    items: [],
  },
  {
    key: "tep-types",
    label: "Truck Entry Permit (TEP) Type",
    icon: FileCheck,
    description: "Truck Entry Permit type classifications",
    color: "text-orange-600 bg-orange-50 border-orange-200",
    isLive: true,
    items: [],
  },
  {
    key: "park-types",
    label: "Park Types",
    icon: ParkingCircle,
    description: "Classifications for transit and truck parks",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    isLive: true,
    items: [],
  },
  {
    key: "facility-types",
    label: "Facility Type",
    icon: Warehouse,
    description: "Facility classifications linked to park types",
    color: "text-violet-600 bg-violet-50 border-violet-200",
    isLive: true,
    items: [],
  },
  {
    key: "facility-timeslots",
    label: "Facility Timeslot",
    icon: Clock,
    description: "Operational time windows for facility scheduling",
    color: "text-teal-600 bg-teal-50 border-teal-200",
    isLive: true,
    items: [],
  },
  {
    key: "locations",
    label: "Locations",
    icon: MapPin,
    description: "Geographic locations and zones",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    isLive: true,
    items: [],
  },
  {
    key: "payment-types",
    label: "Payment Type & Rate",
    icon: CreditCard,
    description: "Payment types and associated transaction rates",
    color: "text-green-600 bg-green-50 border-green-200",
    isLive: true,
    items: [],
  },
  {
    key: "terminal-gates",
    label: "Terminal Gates",
    icon: DoorOpen,
    description: "Entry and exit gate configurations",
    color: "text-slate-600 bg-slate-50 border-slate-200",
    isLive: true,
    items: [],
  },
  {
    key: "handheld-devices",
    label: "Handheld User Portals",
    icon: Smartphone,
    description: "Handheld devices linked to users and gate/facility locations",
    color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
    isLive: true,
    items: [],
  },
  {
    key: "rfid-tags",
    label: "RFID Tags",
    icon: Radio,
    description: "RFID tag inventory and assignment status",
    color: "text-sky-600 bg-sky-50 border-sky-200",
    isLive: true,
    items: [],
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
  liveTotal,
}: {
  category: OptionCategory;
  isSelected: boolean;
  onSelect: () => void;
  liveTotal?: number;
}) {
  const Icon = category.icon;
  const activeCount = category.items.filter((i) => i.is_active).length;
  const totalCount = category.isLive ? (liveTotal ?? 0) : category.items.length;
  const displayActive = category.isLive ? (liveTotal ?? 0) : activeCount;
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
          {category.isLive ? (
            <>
              <span className="font-medium text-emerald-600">Live API</span>
              <span>·</span>
              <span className="font-medium text-gray-600">{displayActive}</span>
              <span>configured</span>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-600">{displayActive}</span>
              <span>/</span>
              <span>{totalCount}</span>
              <span>active</span>
            </>
          )}
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

function renderLivePanel(key: string) {
  switch (key) {
    case "truck-types":
      return <TruckTypesPanel />;
    case "truck-capacities":
      return <TruckCapacitiesPanel />;
    case "truck-lengths":
      return <TruckLengthsPanel />;
    case "booking-categories":
      return <BookingCategoriesPanel />;
    case "tep-types":
      return <TepTypesPanel />;
    case "park-types":
      return <ParkTypesPanel />;
    case "facility-types":
      return <FacilityTypesPanel />;
    case "payment-types":
      return <PaymentTypesPanel />;
    case "facility-timeslots":
      return <FacilityTimeslotsPanel />;
    case "locations":
      return <LocationsPanel />;
    case "terminal-gates":
      return <TerminalGatesPanel />;
    case "handheld-devices":
      return <HandheldDevicesPanel />;
    case "rfid-tags":
      return <RfidTagsPanel />;
    default:
      return null;
  }
}

function getLiveCount(key: string, counts: Record<string, number>) {
  return counts[key] ?? 0;
}

export function AppOptionsPage() {
  const [selectedKey, setSelectedKey] = useState<string>("payment-types");
  const [search, setSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const paymentTypesTotal = usePaymentTypesCount();
  const facilityTimeslotsTotal = useFacilityTimeslotsCount();
  const truckTypesTotal = useTruckTypesCount();
  const truckCapacitiesTotal = useTruckCapacitiesCount();
  const truckLengthsTotal = useTruckLengthsCount();
  const bookingCategoriesTotal = useBookingCategoriesCount();
  const tepTypesTotal = useTepTypesCount();
  const parkTypesTotal = useParkTypesCount();
  const facilityTypesTotal = useFacilityTypesCount();
  const locationsTotal = useLocationsCount();
  const terminalGatesTotal = useTerminalGatesCount();
  const handheldDevicesTotal = useHandheldDevicesCount();
  const rfidTagsTotal = useRfidTagsCount();

  const liveCounts: Record<string, number> = {
    "truck-types": truckTypesTotal,
    "truck-capacities": truckCapacitiesTotal,
    "truck-lengths": truckLengthsTotal,
    "booking-categories": bookingCategoriesTotal,
    "tep-types": tepTypesTotal,
    "park-types": parkTypesTotal,
    "facility-types": facilityTypesTotal,
    "payment-types": paymentTypesTotal,
    "facility-timeslots": facilityTimeslotsTotal,
    locations: locationsTotal,
    "terminal-gates": terminalGatesTotal,
    "handheld-devices": handheldDevicesTotal,
    "rfid-tags": rfidTagsTotal,
  };

  const selectedCategory = MOCK_OPTIONS.find((c) => c.key === selectedKey) ?? MOCK_OPTIONS[0];
  const isLiveCategory = selectedCategory.isLive === true;

  const filteredCategories = MOCK_OPTIONS.filter(
    (c) =>
      c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.description.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const totalItems =
    MOCK_OPTIONS.reduce((sum, c) => sum + c.items.length, 0) +
    paymentTypesTotal +
    facilityTimeslotsTotal +
    truckTypesTotal +
    truckCapacitiesTotal +
    truckLengthsTotal +
    bookingCategoriesTotal +
    tepTypesTotal +
    parkTypesTotal +
    facilityTypesTotal +
    locationsTotal +
    terminalGatesTotal +
    handheldDevicesTotal +
    rfidTagsTotal;
  const totalActive = MOCK_OPTIONS.reduce(
    (sum, c) => sum + c.items.filter((i) => i.is_active).length,
    0
  );

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
                    liveTotal={cat.isLive ? getLiveCount(cat.key, liveCounts) : undefined}
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
          {!isLiveCategory && (
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
          )}

          {isLiveCategory ? (
            renderLivePanel(selectedKey)
          ) : (
            <DetailPanel category={selectedCategory} search={search} />
          )}
        </div>
      </div>

      {/* ─── Info Notice ─── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[11px] leading-relaxed text-amber-700">
          {isLiveCategory ? (
            <>
              <span className="font-semibold">Live Configuration:</span> {selectedCategory.label} is
              connected to the API. You can create, edit, deactivate, and delete records directly from
              this panel.
            </>
          ) : (
            <>
              <span className="font-semibold">Preview Mode:</span> This category still uses sample data.
              Additional app option categories will be connected to the API as integrations are rolled out.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
