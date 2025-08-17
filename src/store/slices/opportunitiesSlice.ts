import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Opportunity, Lead } from '../../types';

interface OpportunitiesState {
  opportunities: Opportunity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OpportunitiesState = {
  opportunities: [],
  isLoading: false,
  error: null,
};

export const createOpportunity = createAsyncThunk(
  'opportunities/createOpportunity',
  async (lead: Lead) => {
    return new Promise<Opportunity>((resolve) => {
      setTimeout(() => {
        const opportunity: Opportunity = {
          id: `opp-${Date.now()}`,
          name: `${lead.company} - ${lead.name}`,
          stage: 'prospecting',
          amount: undefined,
          accountName: lead.company,
          createdFromLead: lead.id,
          createdAt: new Date().toISOString(),
        };
        resolve(opportunity);
      }, 600);
    });
  }
);

const opportunitiesSlice = createSlice({
  name: 'opportunities',
  initialState,
  reducers: {
    updateOpportunity: (state, action: PayloadAction<{ id: string; updates: Partial<Opportunity> }>) => {
      const { id, updates } = action.payload;
      const oppIndex = state.opportunities.findIndex((opp) => opp.id === id);
      if (oppIndex !== -1) {
        state.opportunities[oppIndex] = { ...state.opportunities[oppIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOpportunity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOpportunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.opportunities.push(action.payload);
      })
      .addCase(createOpportunity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create opportunity';
      });
  },
});

export const { updateOpportunity } = opportunitiesSlice.actions;
export default opportunitiesSlice.reducer;
