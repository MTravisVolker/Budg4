import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddRecurrenceModal from '../AddRecurrenceModal';
import axios from 'axios';
import { act, waitFor } from '@testing-library/react';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddRecurrenceModal', () => {
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
    render(<AddRecurrenceModal {...mockProps} />);
    expect(screen.getByText('Add Recurrence')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<AddRecurrenceModal {...mockProps} show={false} />);
    expect(screen.queryByText('Add Recurrence')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    render(<AddRecurrenceModal {...mockProps} />);
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('submits the form with correct data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    render(<AddRecurrenceModal {...mockProps} />);
    
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Monthly');
      await userEvent.type(screen.getByLabelText(/interval/i), '30');
      
      const submitButton = screen.getByRole('button', { name: /add/i });
      await userEvent.click(submitButton);
    });
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/recurrences/',
      {
        name: 'Monthly',
        interval: '30',
      },
      {
        headers: { Authorization: 'Bearer test-token' },
      }
    );
    
    expect(mockProps.onAdded).toHaveBeenCalled();
  });

  it('shows error message when submission fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Failed to add recurrence'));
    
    render(<AddRecurrenceModal {...mockProps} />);
    
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Monthly');
      await userEvent.type(screen.getByLabelText(/interval/i), '30');
      
      const submitButton = screen.getByRole('button', { name: /add/i });
      await userEvent.click(submitButton);
    });
    
    expect(await screen.findByText('Failed to add recurrence')).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    render(<AddRecurrenceModal {...mockProps} />);
    
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Monthly');
      await userEvent.type(screen.getByLabelText(/interval/i), '30');
      
      const submitButton = screen.getByRole('button', { name: /add/i });
      await userEvent.click(submitButton);
    });
    
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/interval/i)).toHaveValue('');
  });

  it('disables submit button while submitting', async () => {
    mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<AddRecurrenceModal {...mockProps} />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Monthly');
      await userEvent.type(screen.getByLabelText(/interval/i), '30');
      const submitButton = screen.getByRole('button', { name: /add/i });
      await userEvent.click(submitButton);
    });
    const submitButton = screen.getByRole('button', { name: /add/i });
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('requires name field', async () => {
    render(<AddRecurrenceModal {...mockProps} />);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /add/i });
    await userEvent.click(submitButton);
    
    // Check if axios was not called
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
}); 