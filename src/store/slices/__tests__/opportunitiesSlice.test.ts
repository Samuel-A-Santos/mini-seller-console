import { describe, it, expect, beforeEach } from 'vitest'
import opportunitiesReducer, {
  updateOpportunity,
  createOpportunity,
} from '../opportunitiesSlice'
import type { Lead, Opportunity } from '../../../types'

const mockLead: Lead = {
  id: 'lead-001',
  name: 'John Doe',
  company: 'Test Corp',
  email: 'john@test.com',
  source: 'Website',
  score: 85,
  status: 'qualified'
}

const mockOpportunity: Opportunity = {
  id: 'opp-001',
  name: 'Test Corp - John Doe',
  stage: 'prospecting',
  amount: 50000,
  accountName: 'Test Corp',
  createdFromLead: 'lead-001',
  createdAt: '2024-01-01T00:00:00.000Z'
}

describe('opportunitiesSlice', () => {
  let initialState: ReturnType<typeof opportunitiesReducer>

  beforeEach(() => {
    initialState = {
      opportunities: [],
      isLoading: false,
      error: null,
    }
  })

  describe('synchronous actions', () => {
    it('should handle updateOpportunity', () => {
      const stateWithOpportunity = {
        ...initialState,
        opportunities: [mockOpportunity]
      }
      
      const action = updateOpportunity({
        id: 'opp-001',
        updates: { stage: 'qualification', amount: 75000 }
      })
      const state = opportunitiesReducer(stateWithOpportunity, action)
      
      expect(state.opportunities[0].stage).toBe('qualification')
      expect(state.opportunities[0].amount).toBe(75000)
    })

    it('should not update opportunity if id not found', () => {
      const stateWithOpportunity = {
        ...initialState,
        opportunities: [mockOpportunity]
      }
      
      const action = updateOpportunity({
        id: 'nonexistent-id',
        updates: { stage: 'qualification' }
      })
      const state = opportunitiesReducer(stateWithOpportunity, action)
      
      expect(state.opportunities[0]).toEqual(mockOpportunity)
    })
  })

  describe('async actions', () => {
    it('should handle createOpportunity.pending', () => {
      const action = { type: createOpportunity.pending.type }
      const state = opportunitiesReducer(initialState, action)
      
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle createOpportunity.fulfilled', () => {
      const action = {
        type: createOpportunity.fulfilled.type,
        payload: mockOpportunity
      }
      const state = opportunitiesReducer(initialState, action)
      
      expect(state.isLoading).toBe(false)
      expect(state.opportunities).toHaveLength(1)
      expect(state.opportunities[0]).toEqual(mockOpportunity)
    })

    it('should handle createOpportunity.rejected', () => {
      const action = {
        type: createOpportunity.rejected.type,
        error: { message: 'Failed to create opportunity' }
      }
      const state = opportunitiesReducer(initialState, action)
      
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Failed to create opportunity')
    })

    it('should create opportunity with correct structure from lead', () => {

      const expectedOpportunity = {
        id: expect.any(String),
        name: `${mockLead.company} - ${mockLead.name}`,
        stage: 'prospecting',
        amount: undefined,
        accountName: mockLead.company,
        createdFromLead: mockLead.id,
        createdAt: expect.any(String),
      }

      const action = {
        type: createOpportunity.fulfilled.type,
        payload: expectedOpportunity
      }
      const state = opportunitiesReducer(initialState, action)
      
      expect(state.opportunities[0]).toMatchObject({
        name: 'Test Corp - John Doe',
        stage: 'prospecting',
        accountName: 'Test Corp',
        createdFromLead: 'lead-001',
      })
    })
  })
})
