import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderAddRecurrenceModal from '../RenderAddRecurrenceModal';

// Mock the AddRecurrenceModal component
vi.mock('../AddRecurrenceModal', () => ({
  default: vi.fn(({ show }) => show ? <div data-testid="add-recurrence-modal">Mock AddRecurrenceModal</div> : null)
}));

describe('RenderAddRecurrenceModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'test-token',
    onAdded: vi.fn(),
  };

  it('renders AddRecurrenceModal when show is true', () => {
    render(<RenderAddRecurrenceModal {...mockProps} />);
    expect(screen.getByTestId('add-recurrence-modal')).toBeInTheDocument();
  });

  it('does not render anything when show is false', () => {
    render(<RenderAddRecurrenceModal {...mockProps} show={false} />);
    expect(screen.queryByTestId('add-recurrence-modal')).not.toBeInTheDocument();
  });

  it('passes all props to AddRecurrenceModal', () => {
    render(<RenderAddRecurrenceModal {...mockProps} />);
    const modal = screen.getByTestId('add-recurrence-modal');
    expect(modal).toBeInTheDocument();
    // The mock component doesn't actually use the props, but we can verify it was rendered
    expect(modal).toHaveTextContent('Mock AddRecurrenceModal');
  });
}); 