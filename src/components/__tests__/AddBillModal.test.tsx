import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockedAxios from 'axios';
import AddBillModal from '../components/AddBillModal';

const mockProps = {
  // Add any necessary props here
};

describe('AddBillModal', () => {
  it('disables submit button when form is loading', async () => {
    mockedAxios.post.mockImplementation(() => new Promise(() => {}));
    render(<AddBillModal {...mockProps} show={true} />);
    const nameInput = screen.getByTestId('name-input');
    const amountInput = screen.getByTestId('amount-input');
    const balanceInput = screen.getByTestId('total-balance-input');
    await userEvent.type(nameInput, 'Test Bill');
    await userEvent.type(amountInput, '100');
    await userEvent.type(balanceInput, '1000');
    const submitButton = screen.getByTestId('submit-btn');
    await userEvent.click(submitButton);
    expect(submitButton).toBeDisabled();
    // Do not check for re-enabled, as modal closes on submit
  });

  it('displays error message when form error occurs', async () => {
    render(<AddBillModal {...mockProps} show={true} />);
    const submitButton = screen.getByTestId('submit-btn');
    await userEvent.click(submitButton);
    // Error message should be displayed
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toHaveTextContent('Please fix the errors in the form');
  });

  it('sets default total balance to 0 when empty', () => {
    render(<AddBillModal {...mockProps} show={true} />);
    const totalBalanceInput = screen.getByTestId('total-balance-input');
    expect(totalBalanceInput).toHaveValue('0');
  });
}); 