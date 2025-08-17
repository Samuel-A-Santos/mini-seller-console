import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLeads } from '../../test/test-utils'
import TestingControls from '../TestingControls'
import type { RootState } from '../../store'

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

describe('TestingControls', () => {
  it('renders testing controls with all buttons', () => {
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('Testing Controls')).toBeInTheDocument()
    expect(screen.getByText('Use these controls to test different UI states:')).toBeInTheDocument()
    
    expect(screen.getByText('Test Loading State')).toBeInTheDocument()
    expect(screen.getByText('Test Error State')).toBeInTheDocument()
    expect(screen.getByText('Test Empty State')).toBeInTheDocument()
    expect(screen.getByText('Reset to Normal')).toBeInTheDocument()
  })

  it('displays current state information', () => {
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    expect(screen.getByText('Status: Ready')).toBeInTheDocument()
    expect(screen.getByText('Error: None')).toBeInTheDocument()
    expect(screen.getByText('Total Leads: 3')).toBeInTheDocument()
    expect(screen.getByText('Filtered Leads: 3')).toBeInTheDocument()
  })

  it('shows loading status when loading', () => {
    const loadingState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        isLoading: true,
      }
    }

    renderWithProviders(<TestingControls />, {
      preloadedState: loadingState
    })

    expect(screen.getByText('Status: Loading...')).toBeInTheDocument()
  })

  it('shows error status when error exists', () => {
    const errorState = {
      ...mockInitialState,
      leads: {
        ...mockInitialState.leads!,
        error: 'Test error message',
      }
    }

    renderWithProviders(<TestingControls />, {
      preloadedState: errorState
    })

    expect(screen.getByText('Error: Yes')).toBeInTheDocument()
  })

  it('handles test loading state button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    const loadingButton = screen.getByText('Test Loading State')
    await user.click(loadingButton)

    expect(loadingButton).toBeInTheDocument()
  })

  it('handles test error state button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    const errorButton = screen.getByText('Test Error State')
    await user.click(errorButton)

    expect(errorButton).toBeInTheDocument()
  })

  it('handles test empty state button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    const emptyButton = screen.getByText('Test Empty State')
    await user.click(emptyButton)

    expect(emptyButton).toBeInTheDocument()
  })

  it('handles reset to normal button click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    const resetButton = screen.getByText('Reset to Normal')
    await user.click(resetButton)
  
    expect(resetButton).toBeInTheDocument()
  })

  it('applies correct button styling', () => {
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    const loadingButton = screen.getByText('Test Loading State')
    const errorButton = screen.getByText('Test Error State')
    const emptyButton = screen.getByText('Test Empty State')
    const resetButton = screen.getByText('Reset to Normal')

    expect(loadingButton).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700')
    expect(errorButton).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700')
    expect(emptyButton).toHaveClass('bg-yellow-600', 'text-white', 'hover:bg-yellow-700')
    expect(resetButton).toHaveClass('bg-green-600', 'text-white', 'hover:bg-green-700')
  })

  it('displays statistics in responsive grid', () => {
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    const statsContainer = screen.getByText('Status: Ready').parentElement
    expect(statsContainer).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4')
  })

  it('displays buttons in responsive grid', () => {
    renderWithProviders(<TestingControls />, {
      preloadedState: mockInitialState
    })

    const buttonsContainer = screen.getByText('Test Loading State').parentElement
    expect(buttonsContainer).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4')
  })
})
