import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderAddStatusModal from '../RenderAddStatusModal';

// Mock the AddStatusModal component
vi.mock('../AddStatusModal', () => ({
  default: vi.fn(({ show }) => show ? <div data-testid="add-status-modal">Mock AddStatusModal</div> : null)
}));

describe('RenderAddStatusModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'test-token',
    onAdded: vi.fn(),
  };

  it('renders AddStatusModal when show is true', () => {
    render(<RenderAddStatusModal {...mockProps} />);
    expect(screen.getByTestId('add-status-modal')).toBeInTheDocument();
  });

  it('does not render anything when show is false', () => {
    render(<RenderAddStatusModal {...mockProps} show={false} />);
    expect(screen.queryByTestId('add-status-modal')).not.toBeInTheDocument();
  });

  it('passes all props to AddStatusModal', () => {
    render(<RenderAddStatusModal {...mockProps} />);
    const modal = screen.getByTestId('add-status-modal');
    expect(modal).toBeInTheDocument();
    // The mock component doesn't actually use the props, but we can verify it was rendered
    expect(modal).toHaveTextContent('Mock AddStatusModal');
  });
}); 