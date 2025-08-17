import { describe, it, expect, beforeEach } from 'vitest'
import leadsReducer, {
  setSelectedLead,
  setFilters,
  setPage,
  closeDetailPanel,
  updateLeadOptimistic,
  rollbackLeadUpdate,
  removeLead,
  loadLeads,
} from '../leadsSlice'
import type { Lead } from '../../../types'

const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'John Doe',
    company: 'Test Corp',
    email: 'john@test.com',
    source: 'Website',
    score: 85,
    status: 'new'
  },
  {
    id: 'lead-002',
    name: 'Jane Smith',
    company: 'Demo Inc',
    email: 'jane@demo.com',
    source: 'LinkedIn',
    score: 92,
    status: 'contacted'
  },
  {
    id: 'lead-003',
    name: 'Bob Johnson',
    company: 'Sample LLC',
    email: 'bob@sample.com',
    source: 'Referral',
    score: 78,
    status: 'qualified'
  }
]

describe('leadsSlice', () => {
  let initialState: ReturnType<typeof leadsReducer>

  beforeEach(() => {
    initialState = {
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
    }
  })

  describe('synchronous actions', () => {
    it('should handle setSelectedLead', () => {
      const lead = mockLeads[0]
      const action = setSelectedLead(lead)
      const state = leadsReducer(initialState, action)
      
      expect(state.selectedLead).toEqual(lead)
      expect(state.isDetailPanelOpen).toBe(true)
    })

    it('should handle setSelectedLead with null', () => {
      const action = setSelectedLead(null)
      const state = leadsReducer({
        ...initialState,
        selectedLead: mockLeads[0],
        isDetailPanelOpen: true,
      }, action)
      
      expect(state.selectedLead).toBeNull()
      expect(state.isDetailPanelOpen).toBe(false)
    })

    it('should handle closeDetailPanel', () => {
      const action = closeDetailPanel()
      const state = leadsReducer({
        ...initialState,
        selectedLead: mockLeads[0],
        isDetailPanelOpen: true,
      }, action)
      
      expect(state.selectedLead).toBeNull()
      expect(state.isDetailPanelOpen).toBe(false)
    })

    it('should handle setFilters with search', () => {
      const stateWithLeads = {
        ...initialState,
        leads: mockLeads,
        filteredLeads: mockLeads,
        displayedLeads: mockLeads,
        pagination: { ...initialState.pagination, totalItems: 3, totalPages: 1 }
      }
      
      const action = setFilters({ search: 'John' })
      const state = leadsReducer(stateWithLeads, action)
      
      expect(state.filters.search).toBe('John')
      expect(state.filteredLeads).toHaveLength(1)
      expect(state.filteredLeads[0].name).toBe('John Doe')
      expect(state.pagination.currentPage).toBe(1)
    })

    it('should handle setFilters with status filter', () => {
      const stateWithLeads = {
        ...initialState,
        leads: mockLeads,
        filteredLeads: mockLeads,
        displayedLeads: mockLeads,
        pagination: { ...initialState.pagination, totalItems: 3, totalPages: 1 }
      }
      
      const action = setFilters({ status: 'new' })
      const state = leadsReducer(stateWithLeads, action)
      
      expect(state.filters.status).toBe('new')
      expect(state.filteredLeads).toHaveLength(1)
      expect(state.filteredLeads[0].status).toBe('new')
    })

    it('should handle setFilters with sorting', () => {
      const stateWithLeads = {
        ...initialState,
        leads: mockLeads,
        filteredLeads: mockLeads,
        displayedLeads: mockLeads,
        pagination: { ...initialState.pagination, totalItems: 3, totalPages: 1 }
      }
      
      const action = setFilters({ sortBy: 'name', sortOrder: 'asc' })
      const state = leadsReducer(stateWithLeads, action)
      
      expect(state.filters.sortBy).toBe('name')
      expect(state.filters.sortOrder).toBe('asc')
      expect(state.filteredLeads[0].name).toBe('Bob Johnson')
      expect(state.filteredLeads[2].name).toBe('John Doe')
    })

    it('should handle setPage', () => {
      const action = setPage(2)
      const state = leadsReducer({
        ...initialState,
        pagination: { ...initialState.pagination, totalPages: 3 }
      }, action)
      
      expect(state.pagination.currentPage).toBe(2)
    })

    it('should handle updateLeadOptimistic', () => {
      const stateWithLeads = {
        ...initialState,
        leads: mockLeads,
        filteredLeads: mockLeads,
        displayedLeads: mockLeads,
        selectedLead: mockLeads[0],
        pagination: { ...initialState.pagination, totalItems: 3, totalPages: 1 }
      }
      
      const action = updateLeadOptimistic({
        id: 'lead-001',
        updates: { status: 'contacted', email: 'newemail@test.com' }
      })
      const state = leadsReducer(stateWithLeads, action)
      
      expect(state.leads[0].status).toBe('contacted')
      expect(state.leads[0].email).toBe('newemail@test.com')
      expect(state.selectedLead?.status).toBe('contacted')
    })

    it('should handle rollbackLeadUpdate', () => {
      const modifiedLeads = [...mockLeads]
      modifiedLeads[0] = { ...modifiedLeads[0], status: 'contacted' }
      
      const stateWithModifiedLeads = {
        ...initialState,
        leads: modifiedLeads,
        filteredLeads: modifiedLeads,
        displayedLeads: modifiedLeads,
        selectedLead: modifiedLeads[0],
        pagination: { ...initialState.pagination, totalItems: 3, totalPages: 1 }
      }
      
      const action = rollbackLeadUpdate({
        id: 'lead-001',
        originalLead: mockLeads[0]
      })
      const state = leadsReducer(stateWithModifiedLeads, action)
      
      expect(state.leads[0].status).toBe('new')
      expect(state.selectedLead?.status).toBe('new')
    })

    it('should handle removeLead', () => {
      const stateWithLeads = {
        ...initialState,
        leads: mockLeads,
        filteredLeads: mockLeads,
        displayedLeads: mockLeads,
        selectedLead: mockLeads[0],
        isDetailPanelOpen: true,
        pagination: { ...initialState.pagination, totalItems: 3, totalPages: 1 }
      }
      
      const action = removeLead('lead-001')
      const state = leadsReducer(stateWithLeads, action)
      
      expect(state.leads).toHaveLength(2)
      expect(state.leads.find(lead => lead.id === 'lead-001')).toBeUndefined()
      expect(state.selectedLead).toBeNull()
      expect(state.isDetailPanelOpen).toBe(false)
    })
  })

  describe('async actions', () => {
    it('should handle loadLeads.pending', () => {
      const action = { type: loadLeads.pending.type }
      const state = leadsReducer(initialState, action)
      
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle loadLeads.fulfilled', () => {
      const action = {
        type: loadLeads.fulfilled.type,
        payload: mockLeads
      }
      const state = leadsReducer(initialState, action)
      
      expect(state.isLoading).toBe(false)
      expect(state.leads).toEqual(mockLeads)
      expect(state.filteredLeads).toEqual(mockLeads)
      expect(state.displayedLeads).toEqual(mockLeads)
      expect(state.pagination.totalItems).toBe(3)
      expect(state.pagination.totalPages).toBe(1)
    })

    it('should handle loadLeads.rejected', () => {
      const action = {
        type: loadLeads.rejected.type,
        error: { message: 'Network error' }
      }
      const state = leadsReducer(initialState, action)
      
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Network error')
    })
  })

  describe('pagination logic', () => {
    it('should paginate correctly with page size 100', () => {
      const manyLeads = Array.from({ length: 150 }, (_, i) => ({
        ...mockLeads[0],
        id: `lead-${String(i + 1).padStart(3, '0')}`,
        name: `Lead ${i + 1}`,
      }))

      const action = {
        type: loadLeads.fulfilled.type,
        payload: manyLeads
      }
      const state = leadsReducer(initialState, action)
      
      expect(state.pagination.totalItems).toBe(150)
      expect(state.pagination.totalPages).toBe(2)
      expect(state.pagination.pageSize).toBe(100)
      expect(state.displayedLeads).toHaveLength(100)
    })

    it('should handle page navigation correctly', () => {
      const manyLeads = Array.from({ length: 150 }, (_, i) => ({
        ...mockLeads[0],
        id: `lead-${String(i + 1).padStart(3, '0')}`,
        name: `Lead ${i + 1}`,
      }))

      let state = leadsReducer(initialState, {
        type: loadLeads.fulfilled.type,
        payload: manyLeads
      })

      state = leadsReducer(state, setPage(2))
      
      expect(state.pagination.currentPage).toBe(2)
      expect(state.displayedLeads).toHaveLength(50)
    })
  })
})
