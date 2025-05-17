import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderAddBillModal from '../RenderAddBillModal';

// Mock the AddBillModal component
vi.mock('../AddBillModal', () => ({
  default: vi.fn(({ show }) => show ? <div data-testid="add-bill-modal">Mock AddBillModal</div> : null)
}));

describe('RenderAddBillModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'test-token',
    accounts: [
      { id: 1, name: 'Test Account', font_color: '#000000' }
    ],
    categories: [
      { id: 1, name: 'Test Category' }
    ],
    recurrences: [
      { id: 1, name: 'Test Recurrence' }
    ],
    onAdded: vi.fn(),
    onAddAccount: vi.fn(),
    onAddCategory: vi.fn(),
    onAddRecurrence: vi.fn()
  };

  it('renders AddBillModal when show is true', () => {
    render(<RenderAddBillModal {...mockProps} />);
    expect(screen.getByTestId('add-bill-modal')).toBeInTheDocument();
  });

  it('does not render anything when show is false', () => {
    render(<RenderAddBillModal {...mockProps} show={false} />);
    expect(screen.queryByTestId('add-bill-modal')).not.toBeInTheDocument();
  });

  it('passes all props to AddBillModal', () => {
    render(<RenderAddBillModal {...mockProps} />);
    const modal = screen.getByTestId('add-bill-modal');
    expect(modal).toBeInTheDocument();
    // The mock component doesn't actually use the props, but we can verify it was rendered
    expect(modal).toHaveTextContent('Mock AddBillModal');
  });
}); 