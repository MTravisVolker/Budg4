import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainTableBody from '../MainTableBody';
import { DueBill, BankAccountInstance, BankAccount, Bill, Status } from '../../types';

describe('MainTableBody', () => {
  const mockProps = {
    dueBills: [] as DueBill[],
    bankInstances: [] as BankAccountInstance[],
    accounts: [] as BankAccount[],
    bills: [] as Bill[],
    statuses: [] as Status[],
    editingCell: null,
    savingEdit: false,
    handleCellDoubleClick: vi.fn(),
    handleEditInputChange: vi.fn(),
    handleEditInputBlur: vi.fn(),
    handleEditInputKeyDown: vi.fn(),
    onDelete: vi.fn(),
    onAddBill: vi.fn(),
    onAddAccount: vi.fn(),
    onAddStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no data is provided', async () => {
    await act(async () => {
      render(
        <table>
          <MainTableBody {...mockProps} />
        </table>
      );
    });
    // Since the component returns a fragment with no visible content when empty,
    // we just verify it renders without errors
    expect(document.body).toBeInTheDocument();
  });

  it('renders bank account instances with their due bills', async () => {
    const mockAccount: BankAccount = {
      id: 1,
      name: 'Test Account',
      font_color: '#000000',
    };

    const mockStatus: Status = {
      id: 1,
      name: 'Pending',
      highlight_color: '#ffffff',
    };

    const mockBankInstance: BankAccountInstance = {
      id: 1,
      bank_account: 1,
      balance: '1000.00',
      pay_date: '2024-03-20',
      status: 1,
    };

    const mockBill: Bill = {
      id: 1,
      name: 'Test Bill',
      default_amount_due: '100.00',
      url: '',
      draft_account: 1,
      category: 1,
      recurrence: 1,
    };

    const mockDueBill: DueBill = {
      id: 1,
      bill: 1,
      amount_due: '100.00',
      due_date: '2024-03-25',
      pay_date: '2024-03-20',
      status: 1,
      draft_account: 1,
      priority: 0,
    };

    const props = {
      ...mockProps,
      accounts: [mockAccount],
      bankInstances: [mockBankInstance],
      bills: [mockBill],
      dueBills: [mockDueBill],
      statuses: [mockStatus],
    };

    await act(async () => {
      render(
        <table>
          <MainTableBody {...props} />
        </table>
      );
    });

    // Verify bank account instance is rendered
    const accountElements = screen.getAllByText('Test Account');
    expect(accountElements.length).toBeGreaterThan(0);
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();

    // Verify due bill is rendered
    expect(screen.getByText('Test Bill')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('sorts due bills by pay date, priority, and due date', async () => {
    const mockAccount: BankAccount = {
      id: 1,
      name: 'Test Account',
      font_color: '#000000',
    };

    const mockStatus: Status = {
      id: 1,
      name: 'Pending',
      highlight_color: '#ffffff',
    };

    const mockBankInstance: BankAccountInstance = {
      id: 1,
      bank_account: 1,
      balance: '1000.00',
      pay_date: '2024-03-20',
      status: 1,
    };

    const mockBill: Bill = {
      id: 1,
      name: 'Test Bill',
      default_amount_due: '100.00',
      url: '',
      draft_account: 1,
      category: 1,
      recurrence: 1,
    };

    const mockDueBills: DueBill[] = [
      {
        id: 1,
        bill: 1,
        amount_due: '100.00',
        due_date: '2024-03-25',
        pay_date: '2024-03-20',
        status: 1,
        draft_account: 1,
        priority: 2,
      },
      {
        id: 2,
        bill: 1,
        amount_due: '200.00',
        due_date: '2024-03-26',
        pay_date: '2024-03-20',
        status: 1,
        draft_account: 1,
        priority: 1,
      },
    ];

    const props = {
      ...mockProps,
      accounts: [mockAccount],
      bankInstances: [mockBankInstance],
      bills: [mockBill],
      dueBills: mockDueBills,
      statuses: [mockStatus],
    };

    await act(async () => {
      render(
        <table>
          <MainTableBody {...props} />
        </table>
      );
    });

    const rows = screen.getAllByRole('row');
    // First row should be the bank instance
    expect(rows[0]).toHaveTextContent('Test Account');
    // Second row should be the due bill with priority 1
    expect(rows[1]).toHaveTextContent('$200.00');
    // Third row should be the due bill with priority 2
    expect(rows[2]).toHaveTextContent('$100.00');
  });

  it('calculates subtotals correctly', async () => {
    const mockAccount: BankAccount = {
      id: 1,
      name: 'Test Account',
      font_color: '#000000',
    };

    const mockStatus: Status = {
      id: 1,
      name: 'Pending',
      highlight_color: '#ffffff',
    };

    const mockBankInstance: BankAccountInstance = {
      id: 1,
      bank_account: 1,
      balance: '1000.00',
      pay_date: '2024-03-20',
      status: 1,
    };

    const mockBill: Bill = {
      id: 1,
      name: 'Test Bill',
      default_amount_due: '100.00',
      url: '',
      draft_account: 1,
      category: 1,
      recurrence: 1,
    };

    const mockDueBills: DueBill[] = [
      {
        id: 1,
        bill: 1,
        amount_due: '100.00',
        due_date: '2024-03-25',
        pay_date: '2024-03-20',
        status: 1,
        draft_account: 1,
        priority: 1,
      },
      {
        id: 2,
        bill: 1,
        amount_due: '200.00',
        due_date: '2024-03-26',
        pay_date: '2024-03-20',
        status: 1,
        draft_account: 1,
        priority: 2,
      },
    ];

    const props = {
      ...mockProps,
      accounts: [mockAccount],
      bankInstances: [mockBankInstance],
      bills: [mockBill],
      dueBills: mockDueBills,
      statuses: [mockStatus],
    };

    await act(async () => {
      render(
        <table>
          <MainTableBody {...props} />
        </table>
      );
    });

    // Subtotal should be 1000 - (100 + 200) = 700
    expect(screen.getByText('$700.00')).toBeInTheDocument();
  });

  it('handles cleared status correctly in subtotal calculations', async () => {
    const mockAccount: BankAccount = {
      id: 1,
      name: 'Test Account',
      font_color: '#000000',
    };

    const mockStatuses: Status[] = [
      {
        id: 1,
        name: 'Pending',
        highlight_color: '#ffffff',
      },
      {
        id: 2,
        name: 'cleared',
        highlight_color: '#ffffff',
      },
    ];

    const mockBankInstance: BankAccountInstance = {
      id: 1,
      bank_account: 1,
      balance: '1000.00',
      pay_date: '2024-03-20',
      status: 1,
    };

    const mockBill: Bill = {
      id: 1,
      name: 'Test Bill',
      default_amount_due: '100.00',
      url: '',
      draft_account: 1,
      category: 1,
      recurrence: 1,
    };

    const mockDueBills: DueBill[] = [
      {
        id: 1,
        bill: 1,
        amount_due: '100.00',
        due_date: '2024-03-25',
        pay_date: '2024-03-20',
        status: 1, // Pending
        draft_account: 1,
        priority: 1,
      },
      {
        id: 2,
        bill: 1,
        amount_due: '200.00',
        due_date: '2024-03-26',
        pay_date: '2024-03-20',
        status: 2, // Cleared
        draft_account: 1,
        priority: 2,
      },
    ];

    const props = {
      ...mockProps,
      accounts: [mockAccount],
      bankInstances: [mockBankInstance],
      bills: [mockBill],
      dueBills: mockDueBills,
      statuses: mockStatuses,
    };

    await act(async () => {
      render(
        <table>
          <MainTableBody {...props} />
        </table>
      );
    });

    // Subtotal should be 1000 - 100 = 900 (cleared bill not included)
    expect(screen.getByText('$900.00')).toBeInTheDocument();
  });

  it('handles catch-all group for due bills without matching bank instances', async () => {
    const mockAccount: BankAccount = {
      id: 1,
      name: 'Test Account',
      font_color: '#000000',
    };

    const mockStatus: Status = {
      id: 1,
      name: 'Pending',
      highlight_color: '#ffffff',
    };

    const mockBill: Bill = {
      id: 1,
      name: 'Test Bill',
      default_amount_due: '100.00',
      url: '',
      draft_account: 1,
      category: 1,
      recurrence: 1,
    };

    const mockDueBill: DueBill = {
      id: 1,
      bill: 1,
      amount_due: '100.00',
      due_date: '2024-03-25',
      pay_date: '2024-03-20',
      status: 1,
      draft_account: 1,
      priority: 1,
    };

    const props = {
      ...mockProps,
      accounts: [mockAccount],
      bankInstances: [], // No bank instances
      bills: [mockBill],
      dueBills: [mockDueBill],
      statuses: [mockStatus],
    };

    await act(async () => {
      render(
        <table>
          <MainTableBody {...props} />
        </table>
      );
    });

    // Verify due bill is rendered in catch-all group
    expect(screen.getByText('Test Bill')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    // Subtotal should be 0 - 100 = -100
    expect(screen.getByText('-$100.00')).toBeInTheDocument();
  });
}); 