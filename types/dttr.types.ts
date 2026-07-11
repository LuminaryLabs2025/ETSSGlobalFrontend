export type DTTRRequestMode = "MANUAL" | "AUTOMATED";

export type DTTRTransferType = "exports" | "imports" | "empties" | "gatepass";

export interface DTTRTransferBreakdown {
  exports: number;
  imports: number;
  empties: number;
  gatepass: number;
}

export interface DTTRAutomatedTemplate extends DTTRTransferBreakdown {}

export interface DTTRTerminalRequest {
  id: string;
  terminal_name: string;
  terminal_code: string;
  approved_daily_capacity: number;
  requested: DTTRTransferBreakdown;
  last_updated_at: string;
  request_mode: DTTRRequestMode;
  automated_template?: DTTRAutomatedTemplate;
}

export interface DTTRSubmissionRecord {
  id: string;
  terminal_id: string;
  terminal_name: string;
  submitted_at: string;
  submitted_by: string;
  submitted_by_id: string;
  breakdown: DTTRTransferBreakdown;
  total_requested: number;
  approved_capacity: number;
  request_mode: DTTRRequestMode;
}

export interface DTTREditAuditEntry {
  id: string;
  terminal_id: string;
  terminal_name: string;
  edited_fields: string[];
  edited_at: string;
  performed_by: string;
  performed_by_id: string;
  justification: string;
  approval_reference?: string;
  approval_document_name?: string;
  previous_values: Partial<DTTRTransferBreakdown & { approved_daily_capacity?: number }>;
  new_values: Partial<DTTRTransferBreakdown & { approved_daily_capacity?: number }>;
}

export interface DTTRSummary {
  total_terminals: number;
  total_capacity: number;
  total_requested_today: number;
  manual_terminals: number;
  automated_terminals: number;
  at_capacity: number;
  under_capacity: number;
}

export function sumBreakdown(b: DTTRTransferBreakdown): number {
  return b.exports + b.imports + b.empties + b.gatepass;
}
