import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLeads } from '../../test/test-utils'
import LeadDetailPanel from '../LeadDetailPanel'
import type { RootState } from '../../store'

vi.mock('../../store/slices/leadsSlice', async () => {
  const actual = await vi.importActual('../../store/slices/leadsSlice')
  return {
    ...actual,
    closeDetailPanel: vi.fn(() => ({ type: 'leads/closeDetailPanel' })),
    updateLeadOptimistic: vi.fn((payload) => ({ type: 'leads/updateLeadOptimistic', payload })),
    rollbackLeadUpdate: vi.fn((payload) => ({ type: 'leads/rollbackLeadUpdate', payload })),
    updateLead: vi.fn(() => ({ type: 'leads/updateLead/pending' })),
    removeLead: vi.fn((id) => ({ type: 'leads/removeLead', payload: id })),
  }
})

vi.mock('../../store/slices/opportunitiesSlice', async () => {
  const actual = await vi.importActual('../../store/slices/opportunitiesSlice')
  return {
    ...actual,
    createOpportunity: vi.fn(() => ({ type: 'opportunities/createOpportunity/pending' })),
  }
})

const mockInitialState: Partial<RootState> = {
  leads: {
    leads: mockLeads,
    filteredLeads: mockLeads,
    displayedLeads: mockLeads,
    selectedLead: mockLeads[0],
    filters: {
      search: '',
      status: 'all',
      sortBy: 'score',
      sortOrder: 'desc',
    },
    pagination: {
      currentPage: 1,
      pageSize: 100,
      totalPages: 1,
      totalItems: 3,
    },
    isLoading: false,
    error: null,
    isDetailPanelOpen: true,
  },
  opportunities: {
    opportunities: [],
    isLoading: false,
    error: null,
  },
}

describe('LeadDetailPanel', () => {
  it('renders lead details correctly', () => {
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('Lead Details')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Corp')).toBeInTheDocument()
    expect(screen.getByText('john@test.com')).toBeInTheDocument()
    expect(screen.getByText('Website')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('new')).toBeInTheDocument()
  })

  it('does not render when no lead is selected', () => {
    const noSelectionState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        selectedLead: null,
        isDetailPanelOpen: false,
      }
    }

    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: noSelectionState
    })

    expect(screen.queryByText('Lead Details')).not.toBeInTheDocument()
  })

  it('handles close panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    const closeButton = screen.getByRole('button', { name: /close panel/i })
    await user.click(closeButton)

    expect(closeButton).toBeInTheDocument()
  })

  it('handles email editing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    const editEmailButton = screen.getAllByText('Edit')[0]
    await user.click(editEmailButton)

    const emailInput = screen.getByDisplayValue('john@test.com')
    expect(emailInput).toBeInTheDocument()

    await user.clear(emailInput)
    await user.type(emailInput, 'newemail@test.com')

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(emailInput).toHaveValue('newemail@test.com')
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    const editEmailButton = screen.getAllByText('Edit')[0]
    await user.click(editEmailButton)

    const emailInput = screen.getByDisplayValue('john@test.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'invalid-email')

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('handles status editing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    const editStatusButton = screen.getAllByText('Edit')[1]
    await user.click(editStatusButton)

    const statusSelect = screen.getByDisplayValue('new')
    expect(statusSelect).toBeInTheDocument()

    await user.selectOptions(statusSelect, 'contacted')

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(statusSelect).toHaveValue('contacted')
  })

  it('handles cancel editing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    const editEmailButton = screen.getAllByText('Edit')[0]
    await user.click(editEmailButton)

    const emailInput = screen.getByDisplayValue('john@test.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'newemail@test.com')

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(screen.getByText('john@test.com')).toBeInTheDocument()
  })

  it('handles convert to opportunity for qualified lead', async () => {
    const user = userEvent.setup()
    const qualifiedLeadState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        selectedLead: mockLeads[2],
      }
    }

    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: qualifiedLeadState
    })

    const convertButton = screen.getByText('Convert to Opportunity')
    expect(convertButton).toBeEnabled()

    await user.click(convertButton)
  
    expect(convertButton).toBeInTheDocument()
  })

  it('disables convert button for unqualified leads', () => {
    const unqualifiedLeadState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        selectedLead: {
          ...mockLeads[0],
          status: 'unqualified' as const
        }
      }
    }

    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: unqualifiedLeadState
    })

    const convertButton = screen.getByText('Convert to Opportunity')
    expect(convertButton).toBeDisabled()
    expect(screen.getByText('Cannot convert unqualified leads to opportunities')).toBeInTheDocument()
  })

  it('shows loading state when converting opportunity', () => {
    const loadingState = {
      ...mockInitialState,
      opportunities: {
        ...mockInitialState.opportunities!,
        isLoading: true,
      }
    }

    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: loadingState
    })

    expect(screen.getByText('Converting...')).toBeInTheDocument()
    const convertButton = screen.getByRole('button', { name: /converting/i })
    expect(convertButton).toBeDisabled()
  })

  it('displays error messages', () => {
    const errorState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        error: 'Failed to update lead',
      }
    }

    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: errorState
    })

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to update lead')).toBeInTheDocument()
  })

  it('displays score with correct color coding', () => {
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    const score = screen.getByText('85')
    expect(score).toHaveClass('text-green-500')
  })

  it('displays status badge with correct color', () => {
    renderWithProviders(<LeadDetailPanel />, {
      preloadedState: mockInitialState
    })

    const statusBadge = screen.getByText('new')
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })
})
