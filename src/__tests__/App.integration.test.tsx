import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockLeads } from '../test/test-utils'
import App from '../App'

vi.mock('../store/slices/leadsSlice', async () => {
  const actual = await vi.importActual('../store/slices/leadsSlice')
  return {
    ...actual,
    loadLeads: vi.fn(() => ({
      type: 'leads/loadLeads/fulfilled',
      payload: mockLeads
    }))
  }
})

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the complete application', async () => {
    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('Mini Seller Console')).toBeInTheDocument()
    })

    expect(screen.getByText('Testing Controls')).toBeInTheDocument()
    
    expect(screen.getByText('Leads')).toBeInTheDocument()
    
    expect(screen.getByText('Opportunities')).toBeInTheDocument()
  })

  it('loads leads on app initialization', async () => {
    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })
  })

  it('handles complete lead to opportunity conversion flow', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const bobRow = screen.getByText('Bob Johnson').closest('tr')
    expect(bobRow).toBeInTheDocument()
    
    if (bobRow) {
      await user.click(bobRow)
    }

    await waitFor(() => {
      expect(screen.getByText('Lead Details')).toBeInTheDocument()
    })

    const convertButton = screen.getByText('Convert to Opportunity')
    expect(convertButton).toBeEnabled()
    await user.click(convertButton)

    await waitFor(() => {
      expect(screen.queryByText('Lead Details')).not.toBeInTheDocument()
    })
  })

  it('handles search and filter workflow', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search leads...')
    await user.type(searchInput, 'John')

    expect(searchInput).toHaveValue('John')

    const statusFilter = screen.getByDisplayValue('All Status')
    await user.selectOptions(statusFilter, 'new')

    expect(statusFilter).toHaveValue('new')
  })

  it('handles pagination with 100+ leads', async () => {
    const manyLeads = Array.from({ length: 150 }, (_, i) => ({
      ...mockLeads[0],
      id: `lead-${String(i + 1).padStart(3, '0')}`,
      name: `Lead ${i + 1}`,
    }))

    vi.doMock('../store/slices/leadsSlice', async () => {
      const actual = await vi.importActual('../store/slices/leadsSlice')
      return {
        ...actual,
        loadLeads: vi.fn(() => ({
          type: 'leads/loadLeads/fulfilled',
          payload: manyLeads
        }))
      }
    })

    const user = userEvent.setup()
    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('Showing 1 to 100 of 150 results')).toBeInTheDocument()
    })

    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()

    const nextButton = screen.getByText('Next')
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Showing 101 to 150 of 150 results')).toBeInTheDocument()
    })
  })

  it('handles error states and recovery', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('Testing Controls')).toBeInTheDocument()
    })

    const errorButton = screen.getByText('Test Error State')
    await user.click(errorButton)

    await waitFor(() => {
      expect(screen.getByText('Error: Yes')).toBeInTheDocument()
    })

    const resetButton = screen.getByText('Reset to Normal')
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('Error: None')).toBeInTheDocument()
    })
  })

  it('persists filter preferences', async () => {
    const user = userEvent.setup()
    
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const statusFilter = screen.getByDisplayValue('All Status')
    await user.selectOptions(statusFilter, 'new')

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'leadFilters',
        expect.stringContaining('new')
      )
    })
  })

  it('handles responsive layout changes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    renderWithProviders(<App />)

    expect(screen.getByText('Mini Seller Console')).toBeInTheDocument()
  })

  it('handles lead editing with optimistic updates', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const johnRow = screen.getByText('John Doe').closest('tr')
    if (johnRow) {
      await user.click(johnRow)
    }

    await waitFor(() => {
      expect(screen.getByText('Lead Details')).toBeInTheDocument()
    })

    const editEmailButton = screen.getAllByText('Edit')[0]
    await user.click(editEmailButton)

    const emailInput = screen.getByDisplayValue('john@test.com')
    await user.clear(emailInput)
    await user.type(emailInput, 'newemail@test.com')

    const saveButton = screen.getByText('Save')
    await user.click(saveButton)

    expect(emailInput).toHaveValue('newemail@test.com')
  })
})
