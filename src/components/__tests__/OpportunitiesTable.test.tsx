import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, mockOpportunities } from '../../test/test-utils'
import OpportunitiesTable from '../OpportunitiesTable'
import type { RootState } from '../../store'

const mockInitialState: Partial<RootState> = {
  leads: {
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
  },
  opportunities: {
    opportunities: mockOpportunities,
    isLoading: false,
    error: null,
  },
}

describe('OpportunitiesTable', () => {
  it('renders opportunities table with correct data', () => {
    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('Opportunities')).toBeInTheDocument()
    expect(screen.getByText('Test Corp - John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Corp')).toBeInTheDocument()
    expect(screen.getByText('Prospecting')).toBeInTheDocument()
    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    const loadingState = {
      ...mockInitialState,
      opportunities: {
        ...mockInitialState.opportunities!,
        isLoading: true,
        opportunities: [],
      }
    }

    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: loadingState
    })

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
  })

  it('displays empty state when no opportunities exist', () => {
    const emptyState = {
      ...mockInitialState,
      opportunities: {
        ...mockInitialState.opportunities!,
        opportunities: [],
      }
    }

    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: emptyState
    })

    expect(screen.getByText('No opportunities yet')).toBeInTheDocument()
    expect(screen.getByText('Convert qualified leads to create your first opportunity.')).toBeInTheDocument()
  })

  it('displays stage badges with correct colors', () => {
    const multiStageState = {
      ...mockInitialState,
      opportunities: {
        ...mockInitialState.opportunities!,
        opportunities: [
          ...mockOpportunities,
          {
            ...mockOpportunities[0],
            id: 'opp-002',
            stage: 'qualification' as const,
          },
          {
            ...mockOpportunities[0],
            id: 'opp-003',
            stage: 'closed-won' as const,
          },
          {
            ...mockOpportunities[0],
            id: 'opp-004',
            stage: 'closed-lost' as const,
          }
        ]
      }
    }

    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: multiStageState
    })

    const prospectingBadge = screen.getByText('Prospecting')
    const qualificationBadge = screen.getByText('Qualification')
    const closedWonBadge = screen.getByText('Closed-won')
    const closedLostBadge = screen.getByText('Closed-lost')

    expect(prospectingBadge).toHaveClass('bg-blue-100', 'text-blue-800')
    expect(qualificationBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    expect(closedWonBadge).toHaveClass('bg-green-100', 'text-green-800')
    expect(closedLostBadge).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('formats amounts correctly', () => {
    const opportunitiesWithDifferentAmounts = {
      ...mockInitialState,
      opportunities: {
        ...mockInitialState.opportunities!,
        opportunities: [
          {
            ...mockOpportunities[0],
            amount: 50000,
          },
          {
            ...mockOpportunities[0],
            id: 'opp-002',
            amount: undefined,
          },
          {
            ...mockOpportunities[0],
            id: 'opp-003',
            amount: 1000000,
          }
        ]
      }
    }

    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: opportunitiesWithDifferentAmounts
    })

    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
    expect(screen.getByText('Not set')).toBeInTheDocument()
    expect(screen.getByText('$1,000,000.00')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument()
  })

  it('displays opportunity count correctly', () => {
    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('1 opportunities')).toBeInTheDocument()
  })

  it('displays total value summary in footer', () => {
    const multipleOpportunitiesState = {
      ...mockInitialState,
      opportunities: {
        ...mockInitialState.opportunities!,
        opportunities: [
          ...mockOpportunities,
          {
            ...mockOpportunities[0],
            id: 'opp-002',
            amount: 75000,
          },
          {
            ...mockOpportunities[0],
            id: 'opp-003',
            amount: undefined,
          }
        ]
      }
    }

    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: multipleOpportunitiesState
    })

    expect(screen.getByText('Total Opportunities: 3')).toBeInTheDocument()
    expect(screen.getByText('Total Value: $125,000.00')).toBeInTheDocument()
  })

  it('handles hover effects on table rows', () => {
    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: mockInitialState
    })

    const tableRow = screen.getByText('Test Corp - John Doe').closest('tr')
    expect(tableRow).toHaveClass('hover:bg-gray-50', 'transition-colors', 'duration-150')
  })

  it('displays opportunities in correct table structure', () => {
    renderWithProviders(<OpportunitiesTable />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Stage')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()

    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
  })
})
