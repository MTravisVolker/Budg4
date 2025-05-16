import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBillModal from '../AddBillModal';
import { BankAccount, Category, Recurrence } from '../../types';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('AddBillModal', () => {
  const mockAccounts: BankAccount[] = [
    { id: 1, name: 'Checking', font_color: '#000000' },
    { id: 2, name: 'Savings', font_color: '#000000' },
  ];

  const mockCategories: Category[] = [
    { id: 1, name: 'Housing', highlight_color: '#FF0000' },
    { id: 2, name: 'Utilities', highlight_color: '#00FF00' },
  ];

  const mockRecurrences: Recurrence[] = [
    { id: 1, name: 'Monthly' },
    { id: 2, name: 'Weekly' },
  ];

  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'mock-token',
    onAddAccount: vi.fn(),
    onAddCategory: vi.fn(),
    onAddRecurrence: vi.fn(),
    accounts: mockAccounts,
    categories: mockCategories,
    recurrences: mockRecurrences,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when show is true', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    expect(screen.getByText('Add Bill')).toBeInTheDocument();
  });

  it('does not render when show is false', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} show={false} />);
    });
    expect(screen.queryByText('Add Bill')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('renders all form fields with correct labels', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('total-balance-input')).toBeInTheDocument();
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
    expect(screen.getByTestId('draft-account-select')).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
    expect(screen.getByTestId('recurrence-select')).toBeInTheDocument();
    expect(screen.getByTestId('priority-input')).toBeInTheDocument();
  });

  it('renders account options correctly', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    
    const accountSelect = screen.getByTestId('draft-account-select');
    expect(accountSelect).toHaveValue('');
    
    const options = within(accountSelect).getAllByRole('option');
    expect(options).toHaveLength(mockAccounts.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  it('renders category options correctly', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    
    const categorySelect = screen.getByTestId('category-select');
    expect(categorySelect).toHaveValue('');
    
    const options = within(categorySelect).getAllByRole('option');
    expect(options).toHaveLength(mockCategories.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Housing')).toBeInTheDocument();
    expect(screen.getByText('Utilities')).toBeInTheDocument();
  });

  it('renders recurrence options correctly', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    
    const recurrenceSelect = screen.getByTestId('recurrence-select');
    expect(recurrenceSelect).toHaveValue('');
    
    const options = within(recurrenceSelect).getAllByRole('option');
    expect(options).toHaveLength(mockRecurrences.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('calls onAddAccount when "Add new" is selected for account', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    const accountSelect = screen.getByTestId('draft-account-select');
    await act(async () => {
      await userEvent.selectOptions(accountSelect, '__add__');
    });
    expect(mockProps.onAddAccount).toHaveBeenCalled();
  });

  it('calls onAddCategory when "Add new" is selected for category', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    const categorySelect = screen.getByTestId('category-select');
    await act(async () => {
      await userEvent.selectOptions(categorySelect, '__add__');
    });
    expect(mockProps.onAddCategory).toHaveBeenCalled();
  });

  it('calls onAddRecurrence when "Add new" is selected for recurrence', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    const recurrenceSelect = screen.getByTestId('recurrence-select');
    await act(async () => {
      await userEvent.selectOptions(recurrenceSelect, '__add__');
    });
    expect(mockProps.onAddRecurrence).toHaveBeenCalled();
  });

  it('calls onAddAccount when clicking the Add button next to account', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    const addButton = screen.getByTestId('add-account-btn');
    await act(async () => {
      await userEvent.click(addButton);
    });
    expect(mockProps.onAddAccount).toHaveBeenCalled();
  });

  it('calls onAddCategory when clicking the Add button next to category', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    const addButton = screen.getByTestId('add-category-btn');
    await act(async () => {
      await userEvent.click(addButton);
    });
    expect(mockProps.onAddCategory).toHaveBeenCalled();
  });

  it('calls onAddRecurrence when clicking the Add button next to recurrence', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    const addButton = screen.getByTestId('add-recurrence-btn');
    await act(async () => {
      await userEvent.click(addButton);
    });
    expect(mockProps.onAddRecurrence).toHaveBeenCalled();
  });

  it('submits the form with required fields', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    
    // Fill in required fields
    const nameInput = screen.getByTestId('name-input');
    await act(async () => {
      await userEvent.type(nameInput, 'Test Bill');
    });
    
    const amountInput = screen.getByTestId('amount-input');
    await act(async () => {
      await userEvent.type(amountInput, '1000');
    });
    
    const totalBalanceInput = screen.getByTestId('total-balance-input');
    await act(async () => {
      await userEvent.type(totalBalanceInput, '5000');
    });
    
    // Submit the form
    const form = screen.getByTestId('bill-form');
    const submitButton = screen.getByTestId('submit-btn');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: vi.fn() });
    
    await act(async () => {
      form.dispatchEvent(submitEvent);
      await userEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(submitEvent.preventDefault).toHaveBeenCalled();
    });
  });

  it('displays error message when form error occurs', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Failed to create bill'));
    
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    
    // Fill in required fields
    const nameInput = screen.getByTestId('name-input');
    await act(async () => {
      await userEvent.type(nameInput, 'Test Bill');
    });
    
    const amountInput = screen.getByTestId('amount-input');
    await act(async () => {
      await userEvent.type(amountInput, '1000');
    });
    
    const totalBalanceInput = screen.getByTestId('total-balance-input');
    await act(async () => {
      await userEvent.type(totalBalanceInput, '5000');
    });
    
    // Submit the form
    const submitButton = screen.getByTestId('submit-btn');
    await act(async () => {
      await userEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create bill')).toBeInTheDocument();
    });
  });

  it('validates URL format', async () => {
    await act(async () => {
      render(<AddBillModal {...mockProps} />);
    });
    
    // Fill in required fields
    const nameInput = screen.getByTestId('name-input');
    await act(async () => {
      await userEvent.type(nameInput, 'Test Bill');
    });
    
    const amountInput = screen.getByTestId('amount-input');
    await act(async () => {
      await userEvent.type(amountInput, '1000');
    });
    
    const totalBalanceInput = screen.getByTestId('total-balance-input');
    await act(async () => {
      await userEvent.type(totalBalanceInput, '5000');
    });
    
    // Test invalid URL (over 2083 characters)
    const urlInput = screen.getByTestId('url-input');
    const longUrl = 'https://example.com/' + 'a'.repeat(2084); // 2084+ length
    fireEvent.change(urlInput, { target: { value: longUrl, name: 'url' } });
    // Wait for the error to appear in the url-error span
    const urlError = await screen.findByTestId('url-error');
    expect(urlError).toHaveTextContent('URL must be no more than 2083 characters');
    
    // Submit the form (should not clear the error)
    const submitButton = screen.getByTestId('submit-btn');
    await act(async () => {
      await userEvent.click(submitButton);
    });
    // Error should still be present
    expect(screen.getByTestId('url-error')).toHaveTextContent('URL must be no more than 2083 characters');
    
    // Test valid URL (should not show error)
    await act(async () => {
      await userEvent.clear(urlInput);
      await userEvent.type(urlInput, 'https://example.com');
    });
    // Wait a bit for error to clear
    await new Promise(res => setTimeout(res, 100));
    expect(screen.queryByTestId('url-error')).not.toBeInTheDocument();
  });
}); 