import React from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import leadsReducer from '../store/slices/leadsSlice'
import opportunitiesReducer from '../store/slices/opportunitiesSlice'
import type { RootState } from '../store'
import type { Lead, Opportunity } from '../types'

export const mockLeads: Lead[] = [
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

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-001',
    name: 'Test Corp - John Doe',
    stage: 'prospecting',
    amount: 50000,
    accountName: 'Test Corp',
    createdFromLead: 'lead-001',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
]

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  store?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: ExtendedRenderOptions = {}
) {
  const {
    preloadedState = {},
    store = configureStore({
      reducer: {
        leads: leadsReducer,
        opportunities: opportunitiesReducer,
      } as any,
      preloadedState: preloadedState as any,
    }),
    ...renderOptions
  } = options
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
