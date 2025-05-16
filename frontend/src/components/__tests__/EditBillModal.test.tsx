import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditBillModal from '../EditBillModal';
import axios from 'axios';
import { Mocked } from 'vitest';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('EditBillModal', () => {
  const mockBill = {
    id: 1,
    name: 'Test Bill',
    default_amount_due: 100,
    total_balance: 1000,
    url: 'https://example.com',
    draft_account: 1,
    category: 1,
    recurrence: 1,
    priority: 1
  };

  const mockAccounts = [
    { id: 1, name: 'Account 1', font_color: '#000000' },
    { id: 2, name: 'Account 2', font_color: '#ffffff' }
  ];

  const mockCategories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' }
  ];

  const mockRecurrences = [
    { id: 1, name: 'Recurrence 1' },
    { id: 2, name: 'Recurrence 2' }
  ];

  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'test-token',
    bill: mockBill,
    accounts: mockAccounts,
    categories: mockCategories,
    recurrences: mockRecurrences,
    onSaved: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = async () => {
    let utils;
    await act(async () => {
      utils = render(<EditBillModal {...mockProps} show={true} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Edit Bill')).toBeInTheDocument();
    });
    return utils;
  };

  it('renders the modal when show is true', async () => {
    await renderModal();
    expect(screen.getByText('Edit Bill')).toBeInTheDocument();
  });

  it('does not render when show is false', async () => {
    await act(async () => {
      render(<EditBillModal {...mockProps} show={false} />);
    });
    expect(screen.queryByText('Edit Bill')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    await renderModal();
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('renders all form fields with correct labels', async () => {
    await renderModal();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Amount Due')).toBeInTheDocument();
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Draft Account')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Recurrence')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
  });

  it('initializes form with bill values', async () => {
    await renderModal();
    expect(screen.getByTestId('name-input')).toHaveValue(mockBill.name);
    expect(screen.getByTestId('amount-due-input')).toHaveValue(mockBill.default_amount_due);
    expect(screen.getByTestId('total-balance-input')).toHaveValue(mockBill.total_balance);
    expect(screen.getByTestId('url-input')).toHaveValue(mockBill.url);
  });

  it('updates form fields when changed', async () => {
    await renderModal();
    const nameInput = screen.getByTestId('name-input');
    await act(async () => {
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'New Bill Name');
    });
    expect(nameInput).toHaveValue('New Bill Name');
  });

  it('handles API errors', async () => {
    const errorMessage = 'Failed to update bill';
    mockedAxios.put.mockRejectedValueOnce({ response: { data: { detail: errorMessage } } });
    await renderModal();

    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      await userEvent.click(submitButton);
    });

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBe(1);
      expect(alerts[0]).toHaveTextContent(errorMessage);
    });
  });

  it('disables submit button when loading', async () => {
    mockedAxios.put.mockImplementation(() => new Promise(() => {}));
    await renderModal();

    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      await userEvent.click(submitButton);
    });

    expect(submitButton).toBeDisabled();
  });

  it('renders account options correctly', async () => {
    await renderModal();
    const accountSelect = screen.getByTestId('draft-account-select');
    const options = within(accountSelect).getAllByRole('option');
    expect(options).toHaveLength(mockAccounts.length + 1); // +1 for the empty option
    expect(options[0]).toHaveTextContent('Select account');
    mockAccounts.forEach((account, index) => {
      expect(options[index + 1]).toHaveTextContent(account.name);
    });
  });

  it('renders category options correctly', async () => {
    await renderModal();
    const categorySelect = screen.getByTestId('category-select');
    const options = within(categorySelect).getAllByRole('option');
    expect(options).toHaveLength(mockCategories.length + 1); // +1 for the empty option
    expect(options[0]).toHaveTextContent('Select category');
    mockCategories.forEach((category, index) => {
      expect(options[index + 1]).toHaveTextContent(category.name);
    });
  });

  it('renders recurrence options correctly', async () => {
    await renderModal();
    const recurrenceSelect = screen.getByTestId('recurrence-select');
    const options = within(recurrenceSelect).getAllByRole('option');
    expect(options).toHaveLength(mockRecurrences.length + 1); // +1 for the empty option
    expect(options[0]).toHaveTextContent('Select recurrence');
    mockRecurrences.forEach((recurrence, index) => {
      expect(options[index + 1]).toHaveTextContent(recurrence.name);
    });
  });

  it('submits form with valid data', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: {} });
    await renderModal();

    const submitButton = screen.getByTestId('submit-button');
    
    await act(async () => {
      await userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `/api/bills/${mockBill.id}/`,
        expect.objectContaining({
          name: mockBill.name,
          default_amount_due: mockBill.default_amount_due,
          total_balance: mockBill.total_balance,
          url: mockBill.url,
          draft_account: mockBill.draft_account,
          category: mockBill.category,
          recurrence: mockBill.recurrence,
          priority: mockBill.priority
        }),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(mockProps.onClose).toHaveBeenCalled();
      expect(mockProps.onSaved).toHaveBeenCalled();
    });
  });
}); 