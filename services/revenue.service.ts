import apiClient from "@/api/client";
import { REVENUE } from "@/api/endpoints";
import {
  buildRevenueQueryParams,
  mapRevenueBreakdown,
  mapRevenueSummary,
  mapRevenueTransaction,
  revenueModuleParam,
  unwrapRevenueListPayload,
} from "@/lib/mappers/revenue.mapper";
import type { ApiResponse } from "@/types/api.types";
import type {
  RevenueBreakdownResponse,
  RevenueTransactionsListParams,
  RevenueTransactionsListResponse,
  RevenueSummaryResponse,
  RevenueTransaction,
} from "@/types/e-revenue.types";

type RevenueFilterParams = Omit<RevenueTransactionsListParams, "page" | "limit">;

function listParamsToQuery(params: RevenueTransactionsListParams) {
  return buildRevenueQueryParams({
    page: params.page,
    limit: params.limit,
    search: params.search,
    payment_source: params.payment_source,
    payment_method: params.payment_method,
    status: params.status,
    date_from: params.date_from,
    date_to: params.date_to,
    amount_min: params.amount_min,
    amount_max: params.amount_max,
    sort_by: params.sort_by,
    sort_dir: params.sort_dir,
  });
}

function filterParamsToQuery(params: RevenueFilterParams) {
  return buildRevenueQueryParams({
    search: params.search,
    payment_source: params.payment_source,
    payment_method: params.payment_method,
    status: params.status,
    date_from: params.date_from,
    date_to: params.date_to,
    amount_min: params.amount_min,
    amount_max: params.amount_max,
    sort_by: params.sort_by,
    sort_dir: params.sort_dir,
  });
}

function parseTransactionList(
  payload: unknown,
  params: RevenueTransactionsListParams,
): RevenueTransactionsListResponse {
  if (
    payload
    && typeof payload === "object"
    && !Array.isArray(payload)
    && Array.isArray((payload as RevenueTransactionsListResponse).data)
  ) {
    const wrapped = payload as RevenueTransactionsListResponse & {
      data: Record<string, unknown>[];
    };
    return {
      data: wrapped.data.map((row) =>
        mapRevenueTransaction(row as unknown as Record<string, unknown>),
      ),
      meta: wrapped.meta,
    };
  }

  if (Array.isArray(payload)) {
    const list = payload.map((row) =>
      mapRevenueTransaction(row as Record<string, unknown>),
    );
    return {
      data: list,
      meta: {
        total: list.length,
        page: params.page ?? 1,
        limit: params.limit ?? list.length,
        total_pages: 1,
      },
    };
  }

  return {
    data: [],
    meta: {
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total_pages: 0,
    },
  };
}

export const revenueService = {
  listTransactions: async (
    params: RevenueTransactionsListParams,
  ): Promise<RevenueTransactionsListResponse> => {
    const module = revenueModuleParam(params.module);
    const { data } = await apiClient.get<ApiResponse<unknown>>(
      REVENUE.TRANSACTIONS(module),
      { params: listParamsToQuery(params) },
    );
    return parseTransactionList(unwrapRevenueListPayload(data.data), params);
  },

  summary: async (params: RevenueFilterParams): Promise<RevenueSummaryResponse> => {
    const module = revenueModuleParam(params.module);
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      REVENUE.SUMMARY(module),
      { params: filterParamsToQuery(params) },
    );
    const payload = data.data ?? {};
    return mapRevenueSummary(
      typeof payload === "object" && payload !== null && !Array.isArray(payload)
        ? payload
        : {},
    );
  },

  breakdown: async (params: RevenueFilterParams): Promise<RevenueBreakdownResponse> => {
    const module = revenueModuleParam(params.module);
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      REVENUE.BREAKDOWN(module),
      { params: filterParamsToQuery(params) },
    );
    return mapRevenueBreakdown(data.data ?? {});
  },

  getTransaction: async (
    module: RevenueTransactionsListParams["module"],
    id: string,
  ): Promise<RevenueTransaction> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      REVENUE.TRANSACTION_BY_ID(revenueModuleParam(module), id),
    );
    return mapRevenueTransaction(data.data ?? {});
  },

  exportCsv: async (params: RevenueTransactionsListParams): Promise<void> => {
    const module = revenueModuleParam(params.module);
    const response = await apiClient.get(REVENUE.EXPORT(module), {
      params: listParamsToQuery(params),
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `e-revenue-${params.module}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
