import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddDueBillModal from '../AddDueBillModal';
import { Bill, Recurrence, BankAccount, Status } from '../../types';
import React from 'react';

function renderWithState(props) {
  function Wrapper() {
    const [form, setForm] = React.useState(props.form);
    return (
      <AddDueBillModal
        {...props}
        form={form}
        onChange={e => {
          const { name, value } = e.target;
          setForm(f => ({ ...f, [name]: value }));
          props.onChange(e);
        }}
      />
    );
  }
  return render(<Wrapper />);
}

describe('AddDueBillModal', () => {
  const mockBills: Bill[] = [
    { id: 1, name: 'Rent', default_amount_due: '1000', total_balance: '0', url: '', draft_account: null, category: null, recurrence: null, priority: 1 },
    { id: 2, name: 'Utilities', default_amount_due: '200', total_balance: '0', url: '', draft_account: null, category: null, recurrence: null, priority: 2 },
  ];

  const mockRecurrences: Recurrence[] = [
    { id: 1, name: 'Monthly' },
    { id: 2, name: 'Weekly' },
  ];

  const mockAccounts: BankAccount[] = [
    { id: 1, name: 'Checking', font_color: '#000000' },
    { id: 2, name: 'Savings', font_color: '#000000' },
  ];

  const mockStatuses: Status[] = [
    { id: 1, name: 'Active', highlight_color: '#00FF00' },
    { id: 2, name: 'Inactive', highlight_color: '#FF0000' },
  ];

  const mockProps = {
    show: true,
    onClose: vi.fn(),
    form: {
      bill: '',
      recurrence: '',
      amount_due: '',
      total_balance: '0',
      draft_account: '',
      due_date: '',
      pay_date: '',
      status: '',
      priority: '0',
    },
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    loading: false,
    error: null,
    bills: mockBills,
    recurrences: mockRecurrences,
    accounts: mockAccounts,
    statuses: mockStatuses,
    onAddBill: vi.fn(),
    onAddRecurrence: vi.fn(),
    onAddAccount: vi.fn(),
    onAddStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when show is true', () => {
    renderWithState(mockProps);
    expect(screen.getByText('Add Due Bill')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    renderWithState({ ...mockProps, show: false });
    expect(screen.queryByText('Add Due Bill')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    renderWithState(mockProps);
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('renders all form fields with correct labels', () => {
    renderWithState(mockProps);
    
    expect(screen.getByTestId('bill-select')).toBeInTheDocument();
    expect(screen.getByTestId('recurrence-select')).toBeInTheDocument();
    expect(screen.getByTestId('amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('total-balance-input')).toBeInTheDocument();
    expect(screen.getByTestId('draft-account-select')).toBeInTheDocument();
    expect(screen.getByTestId('due-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('pay-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
    expect(screen.getByTestId('priority-input')).toBeInTheDocument();
  });

  it('renders bill options correctly', () => {
    renderWithState(mockProps);
    
    const billSelect = screen.getByTestId('bill-select');
    expect(billSelect).toHaveValue('');
    
    const options = within(billSelect).getAllByRole('option');
    expect(options).toHaveLength(mockBills.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Utilities')).toBeInTheDocument();
  });

  it('renders recurrence options correctly', () => {
    renderWithState(mockProps);
    
    const recurrenceSelect = screen.getByTestId('recurrence-select');
    expect(recurrenceSelect).toHaveValue('');
    
    const options = within(recurrenceSelect).getAllByRole('option');
    expect(options).toHaveLength(mockRecurrences.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Monthly')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('renders account options correctly', () => {
    renderWithState(mockProps);
    
    const accountSelect = screen.getByTestId('draft-account-select');
    expect(accountSelect).toHaveValue('');
    
    const options = within(accountSelect).getAllByRole('option');
    expect(options).toHaveLength(mockAccounts.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  it('renders status options correctly', () => {
    renderWithState(mockProps);
    
    const statusSelect = screen.getByTestId('status-select');
    expect(statusSelect).toHaveValue('');
    
    const options = within(statusSelect).getAllByRole('option');
    expect(options).toHaveLength(mockStatuses.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('calls onChange when form fields are updated', async () => {
    renderWithState(mockProps);
    
    // Update bill
    const billSelect = screen.getByTestId('bill-select');
    await act(async () => {
      await userEvent.selectOptions(billSelect, '1');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update recurrence
    const recurrenceSelect = screen.getByTestId('recurrence-select');
    await act(async () => {
      await userEvent.selectOptions(recurrenceSelect, '1');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update amount
    const amountInput = screen.getByTestId('amount-input');
    await act(async () => {
      await userEvent.type(amountInput, '1000');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update total balance
    const totalBalanceInput = screen.getByTestId('total-balance-input');
    await act(async () => {
      await userEvent.type(totalBalanceInput, '5000');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update draft account
    const accountSelect = screen.getByTestId('draft-account-select');
    await act(async () => {
      await userEvent.selectOptions(accountSelect, '1');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update due date
    const dueDateInput = screen.getByTestId('due-date-input');
    await act(async () => {
      await userEvent.type(dueDateInput, '2024-03-20');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update pay date
    const payDateInput = screen.getByTestId('pay-date-input');
    await act(async () => {
      await userEvent.type(payDateInput, '2024-03-15');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update status
    const statusSelect = screen.getByTestId('status-select');
    await act(async () => {
      await userEvent.selectOptions(statusSelect, '1');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update priority
    const priorityInput = screen.getByTestId('priority-input');
    await act(async () => {
      await userEvent.type(priorityInput, '1');
    });
    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it('calls onAddBill when "Add new" is selected for bill', async () => {
    renderWithState(mockProps);
    
    const billSelect = screen.getByTestId('bill-select');
    await act(async () => {
      await userEvent.selectOptions(billSelect, '__add__');
    });
    
    expect(mockProps.onAddBill).toHaveBeenCalled();
  });

  it('calls onAddRecurrence when "Add new" is selected for recurrence', async () => {
    renderWithState(mockProps);
    
    const recurrenceSelect = screen.getByTestId('recurrence-select');
    await act(async () => {
      await userEvent.selectOptions(recurrenceSelect, '__add__');
    });
    
    expect(mockProps.onAddRecurrence).toHaveBeenCalled();
  });

  it('calls onAddAccount when "Add new" is selected for draft account', async () => {
    renderWithState(mockProps);
    
    const accountSelect = screen.getByTestId('draft-account-select');
    await act(async () => {
      await userEvent.selectOptions(accountSelect, '__add__');
    });
    
    expect(mockProps.onAddAccount).toHaveBeenCalled();
  });

  it('calls onAddStatus when "Add new" is selected for status', async () => {
    renderWithState(mockProps);
    
    const statusSelect = screen.getByTestId('status-select');
    await act(async () => {
      await userEvent.selectOptions(statusSelect, '__add__');
    });
    
    expect(mockProps.onAddStatus).toHaveBeenCalled();
  });

  it('calls onAddBill when clicking the Add button next to bill', async () => {
    renderWithState(mockProps);
    
    const addButton = screen.getByTestId('add-bill-btn');
    await act(async () => {
      await userEvent.click(addButton);
    });
    
    expect(mockProps.onAddBill).toHaveBeenCalled();
  });

  it('calls onAddRecurrence when clicking the Add button next to recurrence', async () => {
    renderWithState(mockProps);
    
    const addButton = screen.getByTestId('add-recurrence-btn');
    await act(async () => {
      await userEvent.click(addButton);
    });
    
    expect(mockProps.onAddRecurrence).toHaveBeenCalled();
  });

  it('calls onAddAccount when clicking the Add button next to account', async () => {
    renderWithState(mockProps);
    
    const addButton = screen.getByTestId('add-account-btn');
    await act(async () => {
      await userEvent.click(addButton);
    });
    
    expect(mockProps.onAddAccount).toHaveBeenCalled();
  });

  it('calls onAddStatus when clicking the Add button next to status', async () => {
    renderWithState(mockProps);
    
    const addButton = screen.getByTestId('add-status-btn');
    await act(async () => {
      await userEvent.click(addButton);
    });
    
    expect(mockProps.onAddStatus).toHaveBeenCalled();
  });

  it('submits the form with required fields', async () => {
    renderWithState(mockProps);
    
    // Fill in required fields
    const billSelect = screen.getByTestId('bill-select');
    await act(async () => {
      await userEvent.selectOptions(billSelect, '1');
    });
    
    const amountInput = screen.getByTestId('amount-input');
    await act(async () => {
      await userEvent.type(amountInput, '1000');
    });
    
    const dueDateInput = screen.getByTestId('due-date-input');
    await act(async () => {
      await userEvent.type(dueDateInput, '2024-03-20');
    });
    
    // Submit the form
    const form = screen.getByTestId('due-bill-form');
    await act(async () => {
      await userEvent.click(screen.getByTestId('submit-btn'));
    });
    
    // Wait for form submission
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('disables submit button when loading is true', () => {
    renderWithState({ ...mockProps, loading: true });
    
    const submitButton = screen.getByTestId('submit-btn');
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when required fields are empty', () => {
    renderWithState(mockProps);
    
    const submitButton = screen.getByTestId('submit-btn');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when required fields are filled', async () => {
    renderWithState(mockProps);
    
    // Fill in required fields
    const billSelect = screen.getByTestId('bill-select');
    await act(async () => {
      await userEvent.selectOptions(billSelect, '1');
    });
    
    const amountInput = screen.getByTestId('amount-input');
    await act(async () => {
      await userEvent.type(amountInput, '1000');
    });
    
    const dueDateInput = screen.getByTestId('due-date-input');
    await act(async () => {
      await userEvent.type(dueDateInput, '2024-03-20');
    });
    
    // Wait for button to be enabled
    await waitFor(() => {
      const submitButton = screen.getByTestId('submit-btn');
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it('submits the form with all fields filled', async () => {
    renderWithState(mockProps);
    
    // Fill in all fields
    const billSelect = screen.getByTestId('bill-select');
    await act(async () => {
      await userEvent.selectOptions(billSelect, '1');
    });
    
    const recurrenceSelect = screen.getByTestId('recurrence-select');
    await act(async () => {
      await userEvent.selectOptions(recurrenceSelect, '1');
    });
    
    const amountInput = screen.getByTestId('amount-input');
    await act(async () => {
      await userEvent.type(amountInput, '1000');
    });
    
    const totalBalanceInput = screen.getByTestId('total-balance-input');
    await act(async () => {
      await userEvent.type(totalBalanceInput, '5000');
    });
    
    const accountSelect = screen.getByTestId('draft-account-select');
    await act(async () => {
      await userEvent.selectOptions(accountSelect, '1');
    });
    
    const dueDateInput = screen.getByTestId('due-date-input');
    await act(async () => {
      await userEvent.type(dueDateInput, '2024-03-20');
    });
    
    const payDateInput = screen.getByTestId('pay-date-input');
    await act(async () => {
      await userEvent.type(payDateInput, '2024-03-15');
    });
    
    const statusSelect = screen.getByTestId('status-select');
    await act(async () => {
      await userEvent.selectOptions(statusSelect, '1');
    });
    
    const priorityInput = screen.getByTestId('priority-input');
    await act(async () => {
      await userEvent.type(priorityInput, '1');
    });
    
    // Submit the form
    await act(async () => {
      await userEvent.click(screen.getByTestId('submit-btn'));
    });
    
    // Wait for form submission
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to add due bill';
    renderWithState({ ...mockProps, error: errorMessage });
    
    expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
  });

  it('sets default total balance to 0 when empty', () => {
    renderWithState(mockProps);
    
    const totalBalanceInput = screen.getByTestId('total-balance-input');
    expect(totalBalanceInput).toHaveValue(0);
  });

  it('validates priority is a non-negative number', async () => {
    renderWithState(mockProps);
    
    const priorityInput = screen.getByTestId('priority-input');
    expect(priorityInput).toHaveAttribute('min', '0');
    expect(priorityInput).toHaveAttribute('step', '1');
  });
}); 