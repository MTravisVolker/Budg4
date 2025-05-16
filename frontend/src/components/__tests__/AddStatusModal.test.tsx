import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddStatusModal from '../AddStatusModal';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddStatusModal', () => {
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
    render(<AddStatusModal {...mockProps} />);
    expect(screen.getByText('Add Status')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<AddStatusModal {...mockProps} show={false} />);
    expect(screen.queryByText('Add Status')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', async () => {
    render(<AddStatusModal {...mockProps} />);
    const closeButton = screen.getByLabelText('Close');
    await act(async () => {
      await userEvent.click(closeButton);
    });
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('submits the form with correct data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    render(<AddStatusModal {...mockProps} />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Status');
      await userEvent.type(screen.getByLabelText(/highlight color text/i), '#FF0000');
      const submitButton = screen.getByRole('button', { name: /add/i });
      await userEvent.click(submitButton);
    });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/statuses/',
      {
        name: 'Test Status',
        highlight_color: '#FF0000',
      },
      {
        headers: { Authorization: 'Bearer test-token' },
      }
    );
    expect(mockProps.onAdded).toHaveBeenCalled();
  });

  it('shows error message when submission fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Failed to add status'));
    render(<AddStatusModal {...mockProps} />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Status');
      await userEvent.type(screen.getByLabelText(/highlight color text/i), '#FF0000');
      const submitButton = screen.getByRole('button', { name: /add/i });
      await userEvent.click(submitButton);
    });
    expect(await screen.findByText('Failed to add status')).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    render(<AddStatusModal {...mockProps} />);
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/name/i), 'Test Status');
      await userEvent.type(screen.getByLabelText(/highlight color text/i), '#FF0000');
      const submitButton = screen.getByRole('button', { name: /add/i });
      await userEvent.click(submitButton);
    });
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/highlight color text/i)).toHaveValue('');
  });
}); 