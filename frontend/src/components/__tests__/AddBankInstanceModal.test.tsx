import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBankInstanceModal from '../AddBankInstanceModal';
import { BankAccount, Status } from '../../types';

describe('AddBankInstanceModal', () => {
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
      bank_account: '',
      balance: '',
      due_date: '',
      pay_date: '',
      status: '',
      priority: '',
    },
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    loading: false,
    error: null,
    accounts: mockAccounts,
    statuses: mockStatuses,
    onAddAccount: vi.fn(),
    onAddStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when show is true', () => {
    render(<AddBankInstanceModal {...mockProps} />);
    expect(screen.getByText('Add Bank Account Instance')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<AddBankInstanceModal {...mockProps} show={false} />);
    expect(screen.queryByText('Add Bank Account Instance')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    render(<AddBankInstanceModal {...mockProps} />);
    const closeButton = screen.getByLabelText('Close');
    await userEvent.click(closeButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('renders all form fields with correct labels', () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    expect(screen.getByTestId('bank-account-select')).toBeInTheDocument();
    expect(screen.getByTestId('balance-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
    expect(screen.getByTestId('priority-input')).toBeInTheDocument();
  });

  it('renders account options correctly', () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    const accountSelect = screen.getByTestId('bank-account-select');
    expect(accountSelect).toHaveValue('');
    
    const options = within(accountSelect).getAllByRole('option');
    expect(options).toHaveLength(mockAccounts.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  it('renders status options correctly', () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    const statusSelect = screen.getByTestId('status-select');
    expect(statusSelect).toHaveValue('');
    
    const options = within(statusSelect).getAllByRole('option');
    expect(options).toHaveLength(mockStatuses.length + 2); // +2 for empty option and "Add new" option
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('calls onChange when form fields are updated', async () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    // Update bank account
    const accountSelect = screen.getByTestId('bank-account-select');
    await userEvent.selectOptions(accountSelect, '1');
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update balance
    const balanceInput = screen.getByTestId('balance-input');
    await userEvent.type(balanceInput, '1000');
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update date
    const dateInput = screen.getByTestId('date-input');
    await userEvent.type(dateInput, '2024-03-20');
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update status
    const statusSelect = screen.getByTestId('status-select');
    await userEvent.selectOptions(statusSelect, '1');
    expect(mockProps.onChange).toHaveBeenCalled();
    
    // Update priority
    const priorityInput = screen.getByTestId('priority-input');
    await userEvent.type(priorityInput, '1');
    expect(mockProps.onChange).toHaveBeenCalled();
  });

  it('calls onAddAccount when "Add new" is selected for account', async () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    const accountSelect = screen.getByTestId('bank-account-select');
    await userEvent.selectOptions(accountSelect, '__add__');
    
    expect(mockProps.onAddAccount).toHaveBeenCalled();
  });

  it('calls onAddStatus when "Add new" is selected for status', async () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    const statusSelect = screen.getByTestId('status-select');
    await userEvent.selectOptions(statusSelect, '__add__');
    
    expect(mockProps.onAddStatus).toHaveBeenCalled();
  });

  it('submits the form when submit button is clicked', async () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    // Fill in required fields
    const accountSelect = screen.getByTestId('bank-account-select');
    await userEvent.selectOptions(accountSelect, '1');
    
    const balanceInput = screen.getByTestId('balance-input');
    await userEvent.type(balanceInput, '1000');
    
    const dateInput = screen.getByTestId('date-input');
    await userEvent.type(dateInput, '2024-03-20');
    
    // Submit the form
    const form = screen.getByTestId('bank-instance-form');
    const submitButton = screen.getByTestId('submit-btn');
    
    // Create a mock form submission event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: vi.fn() });
    
    // Trigger form submission
    form.dispatchEvent(submitEvent);
    await userEvent.click(submitButton);
    
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it('disables submit button when loading is true', () => {
    render(<AddBankInstanceModal {...mockProps} loading={true} />);
    
    const submitButton = screen.getByTestId('submit-btn');
    expect(submitButton).toBeDisabled();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Failed to add bank instance';
    render(<AddBankInstanceModal {...mockProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('sets default priority to 0 when empty', () => {
    render(<AddBankInstanceModal {...mockProps} />);
    
    const priorityInput = screen.getByTestId('priority-input');
    expect(priorityInput).toHaveValue(0);
  });
}); 