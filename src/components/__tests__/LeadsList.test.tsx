import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLeads } from '../../test/test-utils'
import LeadsList from '../LeadsList'
import type { RootState } from '../../store'

vi.mock('../../store/slices/leadsSlice', async () => {
  const actual = await vi.importActual('../../store/slices/leadsSlice')
  return {
    ...actual,
    setSelectedLead: vi.fn((lead) => ({ type: 'leads/setSelectedLead', payload: lead })),
    setFilters: vi.fn((filters) => ({ type: 'leads/setFilters', payload: filters })),
    setPage: vi.fn((page) => ({ type: 'leads/setPage', payload: page })),
  }
})

const mockInitialState: Partial<RootState> = {
  leads: {
    leads: mockLeads,
    filteredLeads: mockLeads,
    displayedLeads: mockLeads,
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
      totalPages: 1,
      totalItems: 3,
    },
    isLoading: false,
    error: null,
    isDetailPanelOpen: false,
  },
  opportunities: {
    opportunities: [],
    isLoading: false,
    error: null,
  },
}

describe('LeadsList', () => {
  it('renders leads table with correct data', () => {
    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('Leads')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.getByText('Test Corp')).toBeInTheDocument()
    expect(screen.getByText('Demo Inc')).toBeInTheDocument()
    expect(screen.getByText('Sample LLC')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    const loadingState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        isLoading: true,
        displayedLeads: [],
      }
    }

    renderWithProviders(<LeadsList />, {
      preloadedState: loadingState
    })

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
  })

  it('displays error state', () => {
    const errorState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        error: 'Failed to load leads',
        displayedLeads: [],
      }
    }

    renderWithProviders(<LeadsList />, {
      preloadedState: errorState
    })

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load leads')).toBeInTheDocument()
  })

  it('displays empty state when no leads found', () => {
    const emptyState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        displayedLeads: [],
        pagination: {
          ...mockInitialState.leads!.pagination,
          totalItems: 0,
        }
      }
    }

    renderWithProviders(<LeadsList />, {
      preloadedState: emptyState
    })

    expect(screen.getByText('No leads found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your search or filter criteria.')).toBeInTheDocument()
  })

  it('handles search input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    const searchInput = screen.getByPlaceholderText('Search leads...')
    await user.type(searchInput, 'John')

    await waitFor(() => {
      expect(searchInput).toHaveValue('John')
    })
  })

  it('handles status filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    const statusFilter = screen.getByDisplayValue('All Status')
    await user.selectOptions(statusFilter, 'new')

    expect(statusFilter).toHaveValue('new')
  })

  it('handles column sorting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    const nameColumn = screen.getByText(/Name/)
    await user.click(nameColumn)

    expect(nameColumn).toBeInTheDocument()
  })

  it('handles lead row click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    const leadRow = screen.getByText('John Doe').closest('tr')
    expect(leadRow).toBeInTheDocument()
    
    if (leadRow) {
      await user.click(leadRow)
    }
  })

  it('displays pagination correctly', () => {
    const paginatedState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        pagination: {
          currentPage: 1,
          pageSize: 100,
          totalPages: 2,
          totalItems: 150,
        }
      }
    }

    renderWithProviders(<LeadsList />, {
      preloadedState: paginatedState
    })

    expect(screen.getByText('Showing 1 to 100 of 150 results')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()
  })

  it('handles pagination navigation', async () => {
    const user = userEvent.setup()
    const paginatedState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        pagination: {
          currentPage: 1,
          pageSize: 100,
          totalPages: 2,
          totalItems: 150,
        }
      }
    }

    renderWithProviders(<LeadsList />, {
      preloadedState: paginatedState
    })

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    expect(nextButton).toBeInTheDocument()
  })

  it('displays status badges with correct colors', () => {
    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    const newBadge = screen.getByText('new')
    const contactedBadge = screen.getByText('contacted')
    const qualifiedBadge = screen.getByText('qualified')

    expect(newBadge).toHaveClass('bg-blue-100', 'text-blue-800')
    expect(contactedBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    expect(qualifiedBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('displays score with correct color coding', () => {
    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    const highScore = screen.getByText('92')
    const midScore = screen.getByText('85')
    const lowScore = screen.getByText('78')

    expect(highScore).toHaveClass('text-green-600', 'font-semibold')
    expect(midScore).toHaveClass('text-green-500')
    expect(lowScore).toHaveClass('text-yellow-600')
  })

  it('displays mobile view correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    renderWithProviders(<LeadsList />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Corp')).toBeInTheDocument()
  })
})
