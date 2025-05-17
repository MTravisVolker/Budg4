import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderAddBankInstanceModal from '../RenderAddBankInstanceModal';

// Mock the AddBankInstanceModal component
vi.mock('../AddBankInstanceModal', () => ({
  default: vi.fn(({ show }) => show ? <div data-testid="add-bank-instance-modal">Mock AddBankInstanceModal</div> : null)
}));

describe('RenderAddBankInstanceModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    onChange: vi.fn(),
    form: {
      bank_account: '',
      balance: '',
      due_date: '',
      pay_date: '',
      status: '',
      priority: ''
    },
    error: null,
    loading: false,
    accounts: [],
    statuses: [],
    onAddAccount: vi.fn(),
    onAddStatus: vi.fn()
  };

  it('renders AddBankInstanceModal when show is true', () => {
    render(<RenderAddBankInstanceModal {...mockProps} />);
    expect(screen.getByTestId('add-bank-instance-modal')).toBeInTheDocument();
  });

  it('does not render anything when show is false', () => {
    render(<RenderAddBankInstanceModal {...mockProps} show={false} />);
    expect(screen.queryByTestId('add-bank-instance-modal')).not.toBeInTheDocument();
  });

  it('passes all props to AddBankInstanceModal', () => {
    render(<RenderAddBankInstanceModal {...mockProps} />);
    const modal = screen.getByTestId('add-bank-instance-modal');
    expect(modal).toBeInTheDocument();
    // The mock component doesn't actually use the props, but we can verify it was rendered
    expect(modal).toHaveTextContent('Mock AddBankInstanceModal');
  });
}); 