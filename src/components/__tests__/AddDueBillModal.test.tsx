import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AddDueBillModal from '../AddDueBillModal';

describe('AddDueBillModal', () => {
  const mockAccounts: BankAccount[] = [
    {
      id: 1,
      name: 'Test Account',
      font_color: '#000000'
    }
  ];

  const mockProps = {
    show: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    onChange: vi.fn(),
    form: {
      bill: '',
      recurrence: '',
      amount_due: '',
      total_balance: '',
      draft_account: '',
      due_date: '',
      pay_date: '',
      status: '',
      priority: ''
    },
    bills: [],
    recurrences: [],
    accounts: mockAccounts,
    statuses: [],
    onAddStatus: vi.fn()
  };

  it('renders correctly', () => {
    render(<AddDueBillModal {...mockProps} />);
    expect(screen.getByTestId('due-bill-form')).toBeInTheDocument();
  });
}); 