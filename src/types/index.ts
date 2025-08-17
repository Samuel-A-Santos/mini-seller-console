export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
}

export interface Opportunity {
  id: string;
  name: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  amount?: number;
  accountName: string;
  createdFromLead: string;
  createdAt: string;
}

export interface LeadFilters {
  search: string;
  status: string;
  sortBy: 'score' | 'name' | 'company';
  sortOrder: 'asc' | 'desc';
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface AppState {
  leads: Lead[];
  opportunities: Opportunity[];
  selectedLead: Lead | null;
  filters: LeadFilters;
  isLoading: boolean;
  error: string | null;
  isDetailPanelOpen: boolean;
}
