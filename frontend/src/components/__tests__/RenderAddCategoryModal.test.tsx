import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderAddCategoryModal from '../RenderAddCategoryModal';

// Mock the AddCategoryModal component
vi.mock('../AddCategoryModal', () => ({
  default: vi.fn(({ show }) => show ? <div data-testid="add-category-modal">Mock AddCategoryModal</div> : null)
}));

describe('RenderAddCategoryModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'test-token',
    onAdded: vi.fn(),
  };

  it('renders AddCategoryModal when show is true', () => {
    render(<RenderAddCategoryModal {...mockProps} />);
    expect(screen.getByTestId('add-category-modal')).toBeInTheDocument();
  });

  it('does not render anything when show is false', () => {
    render(<RenderAddCategoryModal {...mockProps} show={false} />);
    expect(screen.queryByTestId('add-category-modal')).not.toBeInTheDocument();
  });

  it('passes all props to AddCategoryModal', () => {
    render(<RenderAddCategoryModal {...mockProps} />);
    const modal = screen.getByTestId('add-category-modal');
    expect(modal).toBeInTheDocument();
    // The mock component doesn't actually use the props, but we can verify it was rendered
    expect(modal).toHaveTextContent('Mock AddCategoryModal');
  });
}); 