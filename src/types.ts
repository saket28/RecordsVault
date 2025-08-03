export interface RecordItem {
  record_id: number;
  created_at: string;
  category_id: number;
  name: string;
  contact_information: string | null;
  institute_name: string | null;
  account_name: string | null;
  account_owner: string | null;
  id_number: string | null;
  credentials: string | null;
  location: string | null;
  nominee: string | null;
  notes: string | null;
}

export interface Category {
  category_id: number;
  created_at: string;
  name: string;
  is_enabled: boolean;
}

export interface AppData {
    categories: Category[];
    records: RecordItem[];
}
