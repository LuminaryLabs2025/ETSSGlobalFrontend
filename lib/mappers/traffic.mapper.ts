import { TRAFFIC_STATUS_CARDS } from "@/lib/traffic-command-mock-data";
import type {
  CancelledBookingRecord,
  EmergencyType,
  EmergencyTruckRequest,
  LiveTruckMovement,
  LiveTrucksResponse,
  LiveTrucksSummaryResponse,
  OccAiCommandAction,
  OccCancelledBookingsResponse,
  OccEmergenciesResponse,
  OccCapacityRow,
  OccDashboardResponse,
  OccEmergenciesSummary,
  OccNamedValue,
  OccOverviewPeriod,
  OccTerminalRow,
  OccTrucksSummary,
  OccTerminalDowntime,
  OccTerminalEvacuation,
  OccTerminalHourlyTat,
  OccTatByCategory,
  TrafficLocationsResponse,
  MapBarrierInfo,
  TrafficMapLocation,
  TrafficStatusCardKey,
  TrafficStatusCount,
} from "@/types/traffic.types";

type Raw = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || fallback;
  return fallback;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function mapLiveTruckRow(raw: Raw): LiveTruckMovement {
  const stageGroup = str(raw.stage_group ?? raw.stageGroup);
  const stage = str(raw.stage);
  const stageGroupLabel = str(
    raw.stage_group_label ?? raw.stageGroupLabel,
    stageGroup.replace(/_/g, " "),
  );
  return {
    id: str(raw.booking_uuid ?? raw.id),
    bookingId: str(raw.booking_id ?? raw.bookingId),
    plateNumber: str(raw.truck_plate_number ?? raw.plate_number ?? raw.plateNumber),
    driverName: str(raw.driver_name ?? raw.driverName),
    currentLocation: str(raw.current_location ?? raw.currentLocation),
    destination: str(raw.destination),
    status: str(raw.stage_label ?? raw.stageLabel ?? raw.status),
    stage,
    stageGroup,
    stageGroupLabel,
    stageGroupOrder: num(raw.stage_group_order ?? raw.stageGroupOrder, 99),
  };
}

function mapStatusCount(raw: Raw): TrafficStatusCount {
  return {
    key: (raw.key) as TrafficStatusCount["key"],
    label: str(raw.label),
    shortLabel: str(raw.short_label ?? raw.shortLabel),
    count: num(raw.count),
  };
}

function mapGateOperationalStatus(status: string): MapBarrierInfo["status"] {
  const u = status.toUpperCase();
  if (u === "ONLINE" || u === "OPEN") return "OPEN";
  if (u === "OFFLINE" || u === "CLOSED") return "CLOSED";
  return "INACTIVE";
}

function mapGateBarrier(gate: unknown, fallbackLabel: string): MapBarrierInfo {
  const g = (gate ?? {}) as Raw;
  const barriers = asArray(g.barriers);
  const first = (barriers[0] ?? {}) as Raw;
  const gateStatus = str(g.status ?? first.operational_status, "NOT_CONFIGURED");
  return {
    id: str(
      first.barrier_id_number ?? first.id ?? g.id,
      fallbackLabel,
    ),
    status: mapGateOperationalStatus(gateStatus),
    taggedPerHour: num(
      g.trucks_tagged_last_hour
      ?? first.trucks_tagged_last_hour
      ?? g.tagged_per_hour,
    ),
  };
}

function mapLocationKind(raw: Raw): TrafficMapLocation["facilityKind"] {
  const kind = str(raw.kind ?? raw.facility_kind ?? raw.facilityKind, "FACILITY");
  if (
    kind === "FACILITY"
    || kind === "FACILITY_PREGATE"
    || kind === "PREGATE"
    || kind === "EPT"
    || kind === "TERMINAL"
    || kind === "TRANSIT_PARK"
  ) {
    return kind;
  }
  return "FACILITY";
}

function layoutMapPosition(
  id: string,
  index: number,
  total: number,
  latitude: number | null,
  longitude: number | null,
): { mapX: number; mapY: number; hasCoordinates: boolean } {
  if (
    latitude != null
    && longitude != null
    && Number.isFinite(latitude)
    && Number.isFinite(longitude)
  ) {
    const mapX = Math.min(92, Math.max(8, ((longitude + 3.5) / 4) * 84 + 8));
    const mapY = Math.min(88, Math.max(12, ((6.6 - latitude) / 2) * 76 + 12));
    return { mapX, mapY, hasCoordinates: true };
  }

  let hash = index + 1;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const cols = Math.max(4, Math.ceil(Math.sqrt(Math.max(total, 1))));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const mapX = 14 + col * (72 / Math.max(cols - 1, 1)) + (hash % 5);
  const mapY = 18 + row * (58 / Math.max(Math.ceil(total / cols) - 1, 1)) + ((hash >> 4) % 4);
  return {
    mapX: Math.min(90, Math.max(10, mapX)),
    mapY: Math.min(85, Math.max(15, mapY)),
    hasCoordinates: false,
  };
}

function mapLocation(raw: Raw, index: number, total: number): TrafficMapLocation {
  const kind = mapLocationKind(raw);
  const latRaw = raw.latitude ?? raw.lat;
  const lngRaw = raw.longitude ?? raw.lng ?? raw.lon;
  const latitude =
    latRaw === null || latRaw === undefined ? null : num(latRaw, Number.NaN);
  const longitude =
    lngRaw === null || lngRaw === undefined ? null : num(lngRaw, Number.NaN);
  const layout = layoutMapPosition(
    str(raw.id),
    index,
    total,
    Number.isFinite(latitude) ? latitude : null,
    Number.isFinite(longitude) ? longitude : null,
  );
  const atat = raw.atat_minutes ?? raw.hourly_tat_minutes ?? raw.hourlyTatMinutes;
  const hourlyTatMinutes =
    atat === null || atat === undefined ? null : num(atat, Number.NaN);
  const parkTypeLabel = str(
    raw.park_type_label ?? raw.parkTypeLabel ?? raw.park_type ?? raw.parkType,
    "—",
  );

  return {
    id: str(raw.id),
    name: str(raw.name),
    parkId: str(raw.code ?? raw.park_id ?? raw.parkId, "—"),
    parkType: parkTypeLabel,
    parkTypeCode: str(raw.park_type ?? raw.parkType) || undefined,
    facilityKind: kind,
    kindLabel: str(raw.kind_label ?? raw.kindLabel, kind),
    address: str(raw.address) || undefined,
    mapX: num(raw.map_x ?? raw.mapX, layout.mapX),
    mapY: num(raw.map_y ?? raw.mapY, layout.mapY),
    hourlyTatMinutes: Number.isFinite(hourlyTatMinutes) ? hourlyTatMinutes : null,
    hourlyTatLabel: typeof raw.atat_label === "string" ? raw.atat_label : null,
    online: raw.online === true,
    capacity: raw.capacity != null ? num(raw.capacity) : undefined,
    trucksOnSite: raw.trucks_on_site != null ? num(raw.trucks_on_site) : undefined,
    hasCoordinates: layout.hasCoordinates,
    entryBarrier: mapGateBarrier(
      raw.entry_gate ?? raw.entry_barrier ?? raw.entryBarrier,
      "Entry gate",
    ),
    exitBarrier: mapGateBarrier(
      raw.exit_gate ?? raw.exit_barrier ?? raw.exitBarrier,
      "Exit gate",
    ),
  };
}

function readByKind(summaryRaw: Raw, key: string): number {
  const byKind = (summaryRaw.by_kind ?? summaryRaw.byKind ?? {}) as Raw;
  return num(byKind[key]);
}

export function mapLiveTrucksSummary(raw: Raw): LiveTrucksSummaryResponse {
  const countByKey: Record<TrafficStatusCardKey, number> = {
    ON_TRIP: num(raw.on_trip ?? raw.onTrip),
    LEFT_FACILITY: num(raw.left_facility ?? raw.leftFacility),
    LEFT_PREGATE: num(raw.left_pregate ?? raw.leftPregate),
    IN_TERMINAL: num(raw.in_terminal ?? raw.inTerminal),
  };

  const statusCounts = TRAFFIC_STATUS_CARDS.map((card) => ({
    key: card.key,
    label: card.label,
    shortLabel: card.shortLabel,
    count: countByKey[card.key],
  }));

  const byStage = asArray(raw.by_stage ?? raw.byStage).map((s) => {
    const row = s as Raw;
    return {
      stage: str(row.stage),
      label: str(row.label),
      count: num(row.count),
    };
  });

  return {
    totalBookings: num(raw.total_bookings ?? raw.totalBookings),
    onTrip: countByKey.ON_TRIP,
    leftFacility: countByKey.LEFT_FACILITY,
    leftPregate: countByKey.LEFT_PREGATE,
    inTerminal: countByKey.IN_TERMINAL,
    statusCounts,
    byStage,
    lastUpdated: str(raw.last_updated ?? raw.lastUpdated) || undefined,
  };
}

export function mapLiveTrucksResponse(raw: Raw): LiveTrucksResponse {
  const movementsRaw = raw.data ?? raw.movements ?? raw.truck_movements;
  const movements = asArray(movementsRaw).map((m) => mapLiveTruckRow(m as Raw));

  const statusRaw = raw.status_counts ?? raw.statusCounts;
  const statusCounts = Array.isArray(statusRaw)
    ? statusRaw.map((s) => mapStatusCount(s as Raw))
    : [];

  const metaRaw = (raw.meta ?? {}) as Raw;

  return {
    statusCounts,
    movements,
    listedTruckCount: num(
      metaRaw.total ?? raw.listed_truck_count ?? raw.listedTruckCount,
      movements.length,
    ),
    meta: metaRaw.total
      ? {
          total: num(metaRaw.total),
          page: num(metaRaw.page, 1),
          limit: num(metaRaw.limit, movements.length || 20),
          total_pages: num(metaRaw.total_pages ?? metaRaw.totalPages, 1),
        }
      : undefined,
  };
}

export function mapTrafficLocationsResponse(raw: Raw): TrafficLocationsResponse {
  const locs = raw.locations ?? raw.data;
  const list = Array.isArray(locs) ? locs : [];
  const summaryRaw = (raw.summary ?? {}) as Raw;
  const avgAtat =
    summaryRaw.avg_atat_minutes
    ?? summaryRaw.avg_hourly_tat_minutes
    ?? summaryRaw.avgHourlyTatMinutes;
  const avgHourlyTatMinutes =
    avgAtat === null || avgAtat === undefined
      ? null
      : num(avgAtat, Number.NaN);
  const facilityPregates = readByKind(summaryRaw, "FACILITY_PREGATE");
  const pregates = readByKind(summaryRaw, "PREGATE");
  const ept = readByKind(summaryRaw, "EPT");

  return {
    locations: list.map((l, i) => mapLocation(l as Raw, i, list.length)),
    summary: {
      totalLocations: num(summaryRaw.total_locations ?? summaryRaw.totalLocations),
      visibleCount: num(summaryRaw.visible ?? summaryRaw.visible_count ?? summaryRaw.visibleCount),
      onlineCount: num(summaryRaw.online ?? summaryRaw.online_count ?? summaryRaw.onlineCount),
      offlineCount: num(summaryRaw.offline ?? summaryRaw.offline_count ?? summaryRaw.offlineCount),
      facilitiesCount:
        num(summaryRaw.facilities_count ?? summaryRaw.facilitiesCount)
        || readByKind(summaryRaw, "FACILITY"),
      facilityPregatesCount: facilityPregates,
      pregatesCount: pregates,
      eptCount: ept,
      terminalsCount: readByKind(summaryRaw, "TERMINAL"),
      transitParksCount:
        num(summaryRaw.transit_parks_count ?? summaryRaw.transitParksCount)
        || pregates + ept,
      avgHourlyTatMinutes: Number.isFinite(avgHourlyTatMinutes)
        ? avgHourlyTatMinutes
        : null,
      lastUpdated: str(raw.last_updated ?? raw.lastUpdated) || undefined,
    },
  };
}

function mapCapacity(rows: unknown): OccCapacityRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    const row = r as Raw;
    return {
      name: str(row.name),
      capacity: num(row.capacity),
      occupied: num(row.occupied),
    };
  });
}

function mapPeriod(raw: unknown): OccOverviewPeriod | undefined {
  const p = (raw ?? {}) as Raw;
  const from = str(p.from);
  const to = str(p.to);
  if (!from || !to) return undefined;
  return { from, to };
}

function mapTrucksSummary(trucksRaw: unknown): OccTrucksSummary | undefined {
  const trucks = (trucksRaw ?? {}) as Raw;
  if (!trucksRaw || typeof trucksRaw !== "object") return undefined;
  return {
    totalBookings: num(trucks.total_bookings ?? trucks.totalBookings),
    onTrip: num(trucks.on_trip ?? trucks.onTrip),
    leftFacility: num(trucks.left_facility ?? trucks.leftFacility),
    leftPregate: num(trucks.left_pregate ?? trucks.leftPregate),
    inTerminal: num(trucks.in_terminal ?? trucks.inTerminal),
    byStage: asArray(trucks.by_stage ?? trucks.byStage).map((s) => {
      const row = s as Raw;
      return {
        stage: str(row.stage),
        label: str(row.label),
        count: num(row.count),
      };
    }),
    lastUpdated: str(trucks.last_updated ?? trucks.lastUpdated) || undefined,
  };
}

function readEmergencyByType(raw: Raw): Record<EmergencyType, number> {
  const byType = (raw.by_type ?? raw.byType ?? {}) as Raw;
  return {
    TOW_TRUCK: num(byType.TOW_TRUCK ?? byType.TOW_TRUCK_REQUEST) ?? 0,
    BREAKDOWN: num(byType.BREAKDOWN) ?? 0,
    ACCIDENT: num(byType.ACCIDENT) ?? 0,
  };
}

function mapEmergenciesSummary(raw: unknown): OccEmergenciesSummary | undefined {
  const em = (raw ?? {}) as Raw;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;

  if (em.by_type != null || em.byType != null || em.total != null || em.active != null) {
    const byType = readEmergencyByType(em);
    return {
      total: num(em.total) ?? 0,
      active: num(em.active) ?? 0,
      byType,
    };
  }

  if (
    em.active_tow_requests != null
    || em.active_breakdowns != null
    || em.active_accidents != null
    || em.activeTowRequests != null
  ) {
    const byType: Record<EmergencyType, number> = {
      TOW_TRUCK: num(em.active_tow_requests ?? em.activeTowRequests) ?? 0,
      BREAKDOWN: num(em.active_breakdowns ?? em.activeBreakdowns) ?? 0,
      ACCIDENT: num(em.active_accidents ?? em.activeAccidents) ?? 0,
    };
    return {
      total: byType.TOW_TRUCK + byType.BREAKDOWN + byType.ACCIDENT,
      active: byType.TOW_TRUCK + byType.BREAKDOWN + byType.ACCIDENT,
      byType,
    };
  }

  return undefined;
}

function mapTerminals(rows: unknown): OccTerminalRow[] {
  return asArray(rows).map((t) => {
    const row = t as Raw;
    const atat = row.atat_minutes ?? row.atatMinutes;
    return {
      id: str(row.id),
      name: str(row.name),
      code: str(row.code),
      approvedDailyTruckCapacity: num(
        row.approved_daily_truck_capacity ?? row.approvedDailyTruckCapacity,
      ),
      trucksArrived: num(row.trucks_arrived ?? row.trucksArrived),
      trucksInTerminal: num(row.trucks_in_terminal ?? row.trucksInTerminal),
      atatMinutes: atat === null || atat === undefined ? null : num(atat, Number.NaN),
      atatLabel: typeof row.atat_label === "string" ? row.atat_label : null,
    };
  });
}

function mapCancelledBookingRow(row: Raw): CancelledBookingRecord {
  return {
    id: str(row.id ?? row.booking_id ?? row.bookingId),
    bookingId: str(row.booking_id ?? row.bookingId),
    plateNumber: str(row.plate_number ?? row.plateNumber ?? row.truck_plate_number),
    driverName: str(row.driver_name ?? row.driverName),
    category: str(row.category ?? row.booking_type ?? row.booking_type_label),
    reason: str(row.reason ?? row.cancellation_reason),
    cancelledAt: str(row.cancelled_at ?? row.cancelledAt),
  };
}

function parseCancelledBookings(raw: unknown): {
  total: number;
  records: CancelledBookingRecord[];
} {
  if (Array.isArray(raw)) {
    const records = raw.map((c) => mapCancelledBookingRow(c as Raw));
    return { total: records.length, records };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Raw;
    const records = asArray(obj.data ?? obj.items ?? obj.records).map((c) =>
      mapCancelledBookingRow(c as Raw),
    );
    const total = num(obj.total, records.length);
    return { total, records };
  }
  return { total: 0, records: [] };
}

function mapEmergencyTruckRequest(row: Raw): EmergencyTruckRequest {
  const emergencyTypeRaw = str(row.emergency_type ?? row.emergencyType, "TOW_TRUCK");
  const emergencyType = emergencyTypeRaw === "TOW_TRUCK_REQUEST"
    ? "TOW_TRUCK"
    : emergencyTypeRaw;
  return {
    id: str(row.id ?? row.request_id ?? row.requestId),
    driverName: str(row.driver_name ?? row.driverName),
    driverId: str(row.driver_id ?? row.driverId),
    plateNumber: str(row.plate_number ?? row.plateNumber ?? row.truck_plate_number),
    emergencyType: emergencyType as EmergencyTruckRequest["emergencyType"],
    timestamp: str(
      row.timestamp
      ?? row.reported_at
      ?? row.created_at
      ?? row.occurred_at,
    ),
    currentLocation: str(row.current_location ?? row.currentLocation ?? row.location),
    active:
      row.active === true
      || str(row.status).toUpperCase() === "ACTIVE"
      || row.is_active === true,
  };
}

export function mapOccEmergenciesResponse(raw: Raw): OccEmergenciesResponse {
  const summary = mapEmergenciesSummary(raw.summary ?? raw.counts);

  const records = (
    Array.isArray(raw.data)
      ? raw.data
      : asArray(
        (raw.data as Raw | undefined)?.data
        ?? raw.requests
        ?? raw.items,
      )
  ).map((e) => mapEmergencyTruckRequest(e as Raw));

  const metaRaw = (raw.meta ?? {}) as Raw;

  return {
    summary,
    data: records,
    meta: {
      total: num(metaRaw.total, records.length) ?? records.length,
      page: num(metaRaw.page, 1) ?? 1,
      limit: num(metaRaw.limit, records.length || 20) ?? 20,
      total_pages: num(metaRaw.total_pages ?? metaRaw.totalPages, 1) ?? 1,
    },
  };
}

export function mapCancelledBookingsResponse(raw: Raw): OccCancelledBookingsResponse {
  const parsed = parseCancelledBookings(raw);
  const metaRaw = (raw.meta ?? {}) as Raw;
  return {
    data: parsed.records,
    meta: {
      total: num(metaRaw.total, parsed.total) ?? parsed.total,
      page: num(metaRaw.page, 1) ?? 1,
      limit: num(metaRaw.limit, parsed.records.length || 20) ?? 20,
      total_pages: num(metaRaw.total_pages ?? metaRaw.totalPages, 1) ?? 1,
    },
  };
}

function mapTerminalHourlySeries(rows: unknown): OccTerminalHourlyTat[] {
  return asArray(rows).map((t) => {
    const row = t as Raw;
    return {
      hour: str(row.hour ?? row.label),
      apapa: num(row.apapa),
      tincan: num(row.tincan),
      lekki: num(row.lekki),
    } satisfies OccTerminalHourlyTat;
  });
}

export function mapOccDashboard(raw: Raw): OccDashboardResponse {
  const cancelled = parseCancelledBookings(raw.cancelled_bookings ?? raw.cancelledBookings);

  return {
    period: mapPeriod(raw.period),
    lastUpdated: str(raw.last_updated ?? raw.lastUpdated) || undefined,
    trucksSummary: mapTrucksSummary(raw.trucks),
    emergenciesSummary: mapEmergenciesSummary(raw.emergencies),
    cancelledBookingsTotal: cancelled.total,
    terminals: mapTerminals(raw.terminals),
    aiCommandActions: asArray(raw.ai_command_actions ?? raw.aiCommandActions).map((a) => {
      const row = a as Raw;
      return {
        title: str(row.title),
        description: str(row.description),
        accent: str(row.accent, "border-gray-200 bg-white"),
      } satisfies OccAiCommandAction;
    }),
    facilityCapacity: mapCapacity(raw.facility_capacity ?? raw.facilityCapacity),
    facilityTatByCategory: asArray(
      raw.facility_tat_by_category ?? raw.facilityTatByCategory,
    ).map((t) => {
      const row = t as Raw;
      return {
        category: str(row.label ?? row.category),
        minutes: num(row.minutes),
        label: str(row.label) || undefined,
        trucks: row.trucks != null ? num(row.trucks) : undefined,
      } satisfies OccTatByCategory;
    }),
    truckDestinations: asArray(raw.truck_destinations ?? raw.truckDestinations).map((d) => {
      const row = d as Raw;
      return { name: str(row.name), value: num(row.value) } satisfies OccNamedValue;
    }),
    transitParkCapacity: mapCapacity(raw.transit_park_capacity ?? raw.transitParkCapacity),
    terminalHourlyTat: mapTerminalHourlySeries(
      raw.terminal_hourly_tat ?? raw.terminalHourlyTat,
    ),
    terminalHourlyArrivals: mapTerminalHourlySeries(
      raw.terminal_hourly_arrivals ?? raw.terminalHourlyArrivals,
    ),
    terminalEvacuation: asArray(raw.terminal_evacuation ?? raw.terminalEvacuation).map((t) => {
      const row = t as Raw;
      return {
        terminal: str(row.terminal),
        evacuated: num(row.evacuated),
        delivered: num(row.delivered),
      } satisfies OccTerminalEvacuation;
    }),
    terminalDowntime: asArray(raw.terminal_downtime ?? raw.terminalDowntime).map((t) => {
      const row = t as Raw;
      return {
        terminal: str(row.terminal),
        minutes: num(row.minutes),
        reason: str(row.reason),
      } satisfies OccTerminalDowntime;
    }),
    emergencyRequests: asArray(
      raw.emergency_requests
      ?? raw.emergencyRequests
      ?? (raw.emergencies as Raw | undefined)?.requests,
    ).map((e) => mapEmergencyTruckRequest(e as Raw)),
    cancelledBookings: cancelled.records,
  };
}
