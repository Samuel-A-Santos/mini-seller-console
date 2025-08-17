import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Lead, LeadFilters, Pagination } from '../../types';
import leadsData from '../../data/leads.json';

interface LeadsState {
  leads: Lead[];
  filteredLeads: Lead[];
  displayedLeads: Lead[];
  selectedLead: Lead | null;
  filters: LeadFilters;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
  isDetailPanelOpen: boolean;
}

const initialState: LeadsState = {
  leads: [],
  filteredLeads: [],
  displayedLeads: [],
  selectedLead: null,
  filters: {
    search: '',
    status: 'all',
    sortBy: 'score',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    pageSize: 100,
    totalPages: 0,
    totalItems: 0,
  },
  isLoading: false,
  error: null,
  isDetailPanelOpen: false,
};

const loadFiltersFromStorage = (): LeadFilters => {
  try {
    const savedFilters = localStorage.getItem('leadFilters');
    if (savedFilters) {
      return { ...initialState.filters, ...JSON.parse(savedFilters) };
    }
  } catch (error) {
    console.error('Error loading filters from localStorage:', error);
  }
  return initialState.filters;
};

const saveFiltersToStorage = (filters: LeadFilters) => {
  try {
    localStorage.setItem('leadFilters', JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to localStorage:', error);
  }
};

export const loadLeads = createAsyncThunk('leads/loadLeads', async () => {
  return new Promise<Lead[]>((resolve) => {
    setTimeout(() => {
      resolve(leadsData as Lead[]);
    }, 800);
  });
});

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, updates }: { id: string; updates: Partial<Lead> }, { rejectWithValue }) => {
    return new Promise<{ id: string; updates: Partial<Lead> }>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(rejectWithValue('Failed to update lead. Please try again.'));
        } else {
          resolve({ id, updates });
        }
      }, 500);
    });
  }
);

const applyFilters = (leads: Lead[], filters: LeadFilters): Lead[] => {
  let filtered = [...leads];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchLower) ||
        lead.company.toLowerCase().includes(searchLower)
    );
  }

  if (filters.status !== 'all') {
    filtered = filtered.filter((lead) => lead.status === filters.status);
  }

  filtered.sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (filters.sortBy) {
      case 'score':
        aValue = a.score;
        bValue = b.score;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'company':
        aValue = a.company.toLowerCase();
        bValue = b.company.toLowerCase();
        break;
      default:
        aValue = a.score;
        bValue = b.score;
    }

    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    
    return a.id.localeCompare(b.id);
  });

  return filtered;
};

const applyPagination = (leads: Lead[], pagination: Pagination): { displayedLeads: Lead[], updatedPagination: Pagination } => {
  const totalItems = leads.length;
  const totalPages = Math.ceil(totalItems / pagination.pageSize);
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  
  const displayedLeads = leads.slice(startIndex, endIndex);
  
  const updatedPagination = {
    ...pagination,
    totalItems,
    totalPages,
  };
  
  return { displayedLeads, updatedPagination };
};

const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    ...initialState,
    filters: loadFiltersFromStorage(),
  },
  reducers: {
    setSelectedLead: (state, action: PayloadAction<Lead | null>) => {
      state.selectedLead = action.payload;
      state.isDetailPanelOpen = !!action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<LeadFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredLeads = applyFilters(state.leads, state.filters);
      state.pagination.currentPage = 1;
      const { displayedLeads, updatedPagination } = applyPagination(state.filteredLeads, state.pagination);
      state.displayedLeads = displayedLeads;
      state.pagination = updatedPagination;
      saveFiltersToStorage(state.filters);
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
      const { displayedLeads, updatedPagination } = applyPagination(state.filteredLeads, state.pagination);
      state.displayedLeads = displayedLeads;
      state.pagination = updatedPagination;
    },
    closeDetailPanel: (state) => {
      state.isDetailPanelOpen = false;
      state.selectedLead = null;
    },
    updateLeadOptimistic: (state, action: PayloadAction<{ id: string; updates: Partial<Lead> }>) => {
      const { id, updates } = action.payload;
      const leadIndex = state.leads.findIndex((lead) => lead.id === id);
      if (leadIndex !== -1) {
        state.leads[leadIndex] = { ...state.leads[leadIndex], ...updates };
        if (state.selectedLead && state.selectedLead.id === id) {
          state.selectedLead = { ...state.selectedLead, ...updates };
        }
        state.filteredLeads = applyFilters(state.leads, state.filters);
        const { displayedLeads, updatedPagination } = applyPagination(state.filteredLeads, state.pagination);
        state.displayedLeads = displayedLeads;
        state.pagination = updatedPagination;
      }
    },
    rollbackLeadUpdate: (state, action: PayloadAction<{ id: string; originalLead: Lead }>) => {
      const { id, originalLead } = action.payload;
      const leadIndex = state.leads.findIndex((lead) => lead.id === id);
      if (leadIndex !== -1) {
        state.leads[leadIndex] = originalLead;
        if (state.selectedLead && state.selectedLead.id === id) {
          state.selectedLead = originalLead;
        }
        state.filteredLeads = applyFilters(state.leads, state.filters);
        const { displayedLeads, updatedPagination } = applyPagination(state.filteredLeads, state.pagination);
        state.displayedLeads = displayedLeads;
        state.pagination = updatedPagination;
      }
    },
    removeLead: (state, action: PayloadAction<string>) => {
      state.leads = state.leads.filter((lead) => lead.id !== action.payload);
      state.filteredLeads = applyFilters(state.leads, state.filters);
      const { displayedLeads, updatedPagination } = applyPagination(state.filteredLeads, state.pagination);
      state.displayedLeads = displayedLeads;
      state.pagination = updatedPagination;
      if (state.selectedLead?.id === action.payload) {
        state.selectedLead = null;
        state.isDetailPanelOpen = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload;
        state.filteredLeads = applyFilters(action.payload, state.filters);
        const { displayedLeads, updatedPagination } = applyPagination(state.filteredLeads, state.pagination);
        state.displayedLeads = displayedLeads;
        state.pagination = updatedPagination;
      })
      .addCase(loadLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || action.payload as string || 'Failed to load leads';
      })
      .addCase(updateLead.pending, (state) => {
        state.error = null;
      })
      .addCase(updateLead.fulfilled, () => {})
      .addCase(updateLead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedLead,
  setFilters,
  setPage,
  closeDetailPanel,
  updateLeadOptimistic,
  rollbackLeadUpdate,
  removeLead,
} = leadsSlice.actions;

export default leadsSlice.reducer;
