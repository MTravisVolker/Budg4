import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBankAccountModal from '../AddBankAccountModal';
import { GENERIC_API_ERROR } from '../../utils/apiError';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = {
  post: vi.fn()
};

(axios as unknown as typeof mockedAxios).post = mockedAxios.post;

describe('AddBankAccountModal', () => {
  const mockToken = 'test-token';
  const mockOnAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when show is true', () => {
    render(<AddBankAccountModal show={true} onClose={vi.fn()} token={mockToken} onAdded={mockOnAdded} />);
    expect(screen.getByText('Add Bank Account')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<AddBankAccountModal show={false} onClose={vi.fn()} token={mockToken} onAdded={mockOnAdded} />);
    expect(screen.queryByText('Add Bank Account')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    const onClose = vi.fn();
    render(<AddBankAccountModal show={true} onClose={onClose} token={mockToken} onAdded={mockOnAdded} />);
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('submits the form with correct data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    render(<AddBankAccountModal show={true} onClose={vi.fn()} token={mockToken} onAdded={mockOnAdded} />);
    
    // Fill in the form
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test Bank');
      await userEvent.type(screen.getByLabelText('Font Color'), '#000000');
    });

    // Submit the form
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    // Check if axios was called with correct data
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/bankaccounts/',
      {
        name: 'Test Bank',
        font_color: '#000000',
      },
      {
        headers: { Authorization: `Bearer ${mockToken}` },
      }
    );
    
    // Check if onAdded was called
    expect(mockOnAdded).toHaveBeenCalled();
  });

  it('shows error message when submission fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Failed to add bank account'));
    
    render(<AddBankAccountModal show={true} onClose={vi.fn()} token={mockToken} onAdded={mockOnAdded} />);
    
    // Fill in the form
    await act(async () => {
      await userEvent.type(screen.getByLabelText('Name'), 'Test Bank');
      await userEvent.type(screen.getByLabelText('Font Color'), '#000000');
    });

    // Submit the form
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    });

    expect(await screen.findByText(GENERIC_API_ERROR)).toBeInTheDocument();
  });
}); 