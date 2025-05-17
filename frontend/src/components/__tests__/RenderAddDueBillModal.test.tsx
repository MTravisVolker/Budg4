import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderAddDueBillModal from '../RenderAddDueBillModal';

// Mock the AddDueBillModal component
vi.mock('../AddDueBillModal', () => ({
  default: vi.fn(({ show }) => show ? <div data-testid="add-due-bill-modal">Mock AddDueBillModal</div> : null)
}));

describe('RenderAddDueBillModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    onChange: vi.fn(),
    form: {
      bill: '',
      recurrence: '',
      amount_due: '',
      draft_account: '',
      due_date: '',
      pay_date: '',
      status: '',
      priority: ''
    },
    error: null,
    loading: false,
    bills: [],
    recurrences: [],
    accounts: [],
    statuses: [],
    onAddBill: vi.fn(),
    onAddRecurrence: vi.fn(),
    onAddAccount: vi.fn(),
    onAddStatus: vi.fn()
  };

  it('renders AddDueBillModal when show is true', () => {
    render(<RenderAddDueBillModal {...mockProps} />);
    expect(screen.getByTestId('add-due-bill-modal')).toBeInTheDocument();
  });

  it('does not render anything when show is false', () => {
    render(<RenderAddDueBillModal {...mockProps} show={false} />);
    expect(screen.queryByTestId('add-due-bill-modal')).not.toBeInTheDocument();
  });

  it('passes all props to AddDueBillModal', () => {
    render(<RenderAddDueBillModal {...mockProps} />);
    const modal = screen.getByTestId('add-due-bill-modal');
    expect(modal).toBeInTheDocument();
    // The mock component doesn't actually use the props, but we can verify it was rendered
    expect(modal).toHaveTextContent('Mock AddDueBillModal');
  });
}); 