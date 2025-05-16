import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCategoryModal from '../AddCategoryModal';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddCategoryModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'test-token',
    onAdded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when show is true', async () => {
    await act(async () => {
      render(<AddCategoryModal {...mockProps} />);
    });
    expect(screen.getByText('Add Category')).toBeInTheDocument();
  });

  it('does not render when show is false', async () => {
    await act(async () => {
      render(<AddCategoryModal {...mockProps} show={false} />);
    });
    expect(screen.queryByText('Add Category')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    await act(async () => {
      render(<AddCategoryModal {...mockProps} />);
    });
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('submits the form with correct data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    await act(async () => {
      render(<AddCategoryModal {...mockProps} />);
    });
    
    // Fill in the form
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Category');
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });
    
    // Wait for the API call to complete
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/categories/',
        {
          name: 'Test Category',
        },
        {
          headers: { Authorization: 'Bearer test-token' },
        }
      );
    });
    
    // Check if onAdded was called
    expect(mockProps.onAdded).toHaveBeenCalled();
  });

  it('shows error message when submission fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Failed to add category'));
    
    await act(async () => {
      render(<AddCategoryModal {...mockProps} />);
    });
    
    // Fill in the form
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Category');
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to add category')).toBeInTheDocument();
    });
  });
}); 