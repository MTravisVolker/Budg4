import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBankAccountModal from '../AddBankAccountModal';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddBankAccountModal', () => {
  const mockProps = {
    show: true,
    onClose: vi.fn(),
    token: 'test-token',
    onAdded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when show is true', () => {
    render(<AddBankAccountModal {...mockProps} />);
    expect(screen.getByText('Add Bank Account')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<AddBankAccountModal {...mockProps} show={false} />);
    expect(screen.queryByText('Add Bank Account')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    render(<AddBankAccountModal {...mockProps} />);
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('submits the form with correct data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    render(<AddBankAccountModal {...mockProps} />);
    
    // Fill in the form
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Bank');
      await userEvent.type(screen.getByLabelText(/font color text/i), '#000000');
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });
    
    // Wait for the axios call to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check if axios was called with correct data
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/bankaccounts/',
      {
        name: 'Test Bank',
        font_color: '#000000',
      },
      {
        headers: { Authorization: 'Bearer test-token' },
      }
    );
    
    // Check if onAdded was called
    expect(mockProps.onAdded).toHaveBeenCalled();
  });

  it('shows error message when submission fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Failed to add bank account'));
    
    render(<AddBankAccountModal {...mockProps} />);
    
    // Fill in the form
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Bank');
      await userEvent.type(screen.getByLabelText(/font color text/i), '#000000');
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      await userEvent.click(submitButton);
    });
    
    // Wait for the error message to appear
    const errorMessage = await screen.findByText('Failed to add bank account');
    expect(errorMessage).toBeInTheDocument();
  });
}); 