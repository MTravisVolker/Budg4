import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainTableRow from '../MainTableRow';
import { Bill, BankAccount, Status } from '../../types';

const mockBills: Bill[] = [
  { id: 1, name: 'Electric', default_amount_due: '50.00', url: '', draft_account: 1, category: 1, recurrence: 1 },
  { id: 2, name: 'Water', default_amount_due: '30.00', url: 'https://water.com', draft_account: 1, category: 1, recurrence: 1 },
];
const mockAccounts: BankAccount[] = [
  { id: 1, name: 'Checking', font_color: '#000000' },
  { id: 2, name: 'Savings', font_color: '#333333' },
];
const mockStatuses: Status[] = [
  { id: 1, name: 'Pending', highlight_color: '#fffbe6' },
  { id: 2, name: 'cleared', highlight_color: '#e6ffe6' },
];

describe('MainTableRow', () => {
  let handleCellDoubleClick: any;
  let handleEditInputChange: any;
  let handleEditInputBlur: any;
  let handleEditInputKeyDown: any;
  let onDelete: any;
  let onAddBill: any;
  let onAddAccount: any;
  let onAddStatus: any;

  beforeEach(() => {
    handleCellDoubleClick = vi.fn();
    handleEditInputChange = vi.fn();
    handleEditInputBlur = vi.fn();
    handleEditInputKeyDown = vi.fn();
    onDelete = vi.fn();
    onAddBill = vi.fn();
    onAddAccount = vi.fn();
    onAddStatus = vi.fn();
  });

  it('renders a DueBill row with all fields', () => {
    render(
      <table><tbody>
        <MainTableRow
          row={{
            id: 1,
            type: 'DueBill',
            name: 'Electric',
            bill: 1,
            amount_due: '50.00',
            due_date: '2024-04-01',
            pay_date: '2024-03-28',
            status: 1,
            draft_account: 1,
            priority: 2,
            accountObj: mockAccounts[0],
            accountId: 1,
            statusObj: mockStatuses[0],
          }}
          editingCell={null}
          savingEdit={false}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={mockBills}
          accounts={mockAccounts}
          statuses={mockStatuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      </tbody></table>
    );
    expect(screen.getByText('Due Bill')).toBeInTheDocument();
    expect(screen.getByText('Electric')).toBeInTheDocument();
    expect(screen.getByText('03/28/2024')).toBeInTheDocument();
    expect(screen.getByText('04/01/2024')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Checking')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('renders a BankAccountInstance row with all fields', () => {
    render(
      <table><tbody>
        <MainTableRow
          row={{
            id: 2,
            type: 'BankAccountInstance',
            name: 'Checking',
            bank_account: 1,
            balance: '1000.00',
            pay_date: '2024-03-28',
            status: 1,
            accountObj: mockAccounts[0],
            accountId: 1,
            statusObj: mockStatuses[0],
          }}
          editingCell={null}
          savingEdit={false}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={mockBills}
          accounts={mockAccounts}
          statuses={mockStatuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      </tbody></table>
    );
    expect(screen.getByText('Account Instance')).toBeInTheDocument();
    const checkingCells = screen.getAllByText('Checking');
    expect(checkingCells.length).toBeGreaterThan(1);
    expect(screen.getByText('03/28/2024')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <table><tbody>
        <MainTableRow
          row={{
            id: 1,
            type: 'DueBill',
            name: 'Electric',
            bill: 1,
            amount_due: '50.00',
            due_date: '2024-04-01',
            pay_date: '2024-03-28',
            status: 1,
            draft_account: 1,
            priority: 2,
            accountObj: mockAccounts[0],
            accountId: 1,
            statusObj: mockStatuses[0],
          }}
          editingCell={null}
          savingEdit={false}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={mockBills}
          accounts={mockAccounts}
          statuses={mockStatuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      </tbody></table>
    );
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('DueBill', 1);
  });

  it('calls handleCellDoubleClick on double click', () => {
    render(
      <table><tbody>
        <MainTableRow
          row={{
            id: 1,
            type: 'DueBill',
            name: 'Electric',
            bill: 1,
            amount_due: '50.00',
            due_date: '2024-04-01',
            pay_date: '2024-03-28',
            status: 1,
            draft_account: 1,
            priority: 2,
            accountObj: mockAccounts[0],
            accountId: 1,
            statusObj: mockStatuses[0],
          }}
          editingCell={null}
          savingEdit={false}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={mockBills}
          accounts={mockAccounts}
          statuses={mockStatuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      </tbody></table>
    );
    fireEvent.doubleClick(screen.getByText('Electric'));
    expect(handleCellDoubleClick).toHaveBeenCalled();
  });

  it('renders editable input when editingCell matches', () => {
    render(
      <table><tbody>
        <MainTableRow
          row={{
            id: 1,
            type: 'DueBill',
            name: 'Electric',
            bill: 1,
            amount_due: '50.00',
            due_date: '2024-04-01',
            pay_date: '2024-03-28',
            status: 1,
            draft_account: 1,
            priority: 2,
            accountObj: mockAccounts[0],
            accountId: 1,
            statusObj: mockStatuses[0],
          }}
          editingCell={{ rowId: 1, type: 'DueBill', field: 'name', value: 1 }}
          savingEdit={false}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={mockBills}
          accounts={mockAccounts}
          statuses={mockStatuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      </tbody></table>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls handleEditInputChange when editing input changes', async () => {
    render(
      <table><tbody>
        <MainTableRow
          row={{
            id: 1,
            type: 'DueBill',
            name: 'Electric',
            bill: 1,
            amount_due: '50.00',
            due_date: '2024-04-01',
            pay_date: '2024-03-28',
            status: 1,
            draft_account: 1,
            priority: 2,
            accountObj: mockAccounts[0],
            accountId: 1,
            statusObj: mockStatuses[0],
          }}
          editingCell={{ rowId: 1, type: 'DueBill', field: 'name', value: 1 }}
          savingEdit={false}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={mockBills}
          accounts={mockAccounts}
          statuses={mockStatuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      </tbody></table>
    );
    await userEvent.selectOptions(screen.getByRole('combobox'), '2');
    expect(handleEditInputChange).toHaveBeenCalled();
  });

  it('renders a bill name as a link if url is present', () => {
    render(
      <table><tbody>
        <MainTableRow
          row={{
            id: 2,
            type: 'DueBill',
            name: 'Water',
            bill: 2,
            amount_due: '30.00',
            due_date: '2024-04-01',
            pay_date: '2024-03-28',
            status: 1,
            draft_account: 1,
            priority: 1,
            accountObj: mockAccounts[0],
            accountId: 1,
            statusObj: mockStatuses[0],
          }}
          editingCell={null}
          savingEdit={false}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={mockBills}
          accounts={mockAccounts}
          statuses={mockStatuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      </tbody></table>
    );
    const link = screen.getByRole('link', { name: 'Water' });
    expect(link).toHaveAttribute('href', 'https://water.com');
  });
}); 