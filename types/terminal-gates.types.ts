export interface TerminalGate {
  id: string;
  location: string;
  entry_barrier_name: string;
  entry_barrier_id: string;
  exit_barrier_name: string;
  exit_barrier_id: string;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type TerminalGateDetail = TerminalGate;

export interface TerminalGatesListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface TerminalGatesListResponse {
  data: TerminalGate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface TerminalGatePayload {
  location: string;
  entry_barrier_name: string;
  entry_barrier_id: string;
  exit_barrier_name: string;
  exit_barrier_id: string;
}

export interface TerminalGateActionResponse {
  message?: string;
  data?: TerminalGate;
}
