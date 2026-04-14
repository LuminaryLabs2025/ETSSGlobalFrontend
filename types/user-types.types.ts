// ─── Metadata Field Option ───
export interface MetadataFieldOption {
  label: string;
  value: string;
}

// ─── Metadata Field ───
export interface MetadataField {
  name: string;
  type: "string" | "number" | "text" | "select" | "multi-select";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: MetadataFieldOption[];
  optionsSource?: string;
  autoPopulated?: boolean;
  autoPopulatedValue?: string;
}

// ─── User Type Metadata ───
export interface UserTypeMetadata {
  fields: MetadataField[];
}

// ─── User Type ───
export interface UserType {
  id: string;
  name: string;
  slug: string;
  category: "SYSTEM" | "EXTERNAL";
  metadata: UserTypeMetadata | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── User Types List Params ───
export interface UserTypesListParams {
  category?: "SYSTEM" | "EXTERNAL";
}
