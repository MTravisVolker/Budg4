import React from 'react';
import { DueBill, BankAccountInstance, Bill, BankAccount, Status } from '../types';
import { formatDate, formatCurrency } from '../utils/format';

interface MainTableRowProps {
  row: any; // DueBill or BankAccountInstance with extra fields (type, name, statusObj, accountObj, accountId)
  editingCell: {
    rowId: number;
    type: 'DueBill' | 'BankAccountInstance';
    field: string;
    value: string | number;
  } | null;
  savingEdit: boolean;
  handleCellDoubleClick: (row: any, type: 'DueBill' | 'BankAccountInstance', field: string, value: string | number) => void;
  handleEditInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleEditInputBlur: () => void;
  handleEditInputKeyDown: (e: React.KeyboardEvent) => void;
  bills: Bill[];
  accounts: BankAccount[];
  statuses: Status[];
}

const MainTableRow: React.FC<MainTableRowProps> = ({
  row,
  editingCell,
  savingEdit,
  handleCellDoubleClick,
  handleEditInputChange,
  handleEditInputBlur,
  handleEditInputKeyDown,
  bills,
  accounts,
  statuses,
}) => (
  <tr
    key={row.type + '-' + row.id}
    style={{
      background: row.statusObj?.highlight_color || undefined,
      color: row.accountObj?.font_color || undefined,
    }}
  >
    {/* Type */}
    <td style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}>{row.type === 'DueBill' ? 'Due Bill' : 'Account Instance'}</td>
    {/* Name */}
    <td
      style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
      onDoubleClick={() => handleCellDoubleClick(row, row.type, 'name', row.type === 'DueBill' ? row.bill : row.bank_account)}
    >
      {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'name' ? (
        <select
          value={editingCell.value}
          onChange={handleEditInputChange}
          onBlur={handleEditInputBlur}
          onKeyDown={handleEditInputKeyDown}
          autoFocus
          className="input input-bordered"
          disabled={savingEdit}
        >
          <option value="">Select</option>
          {(row.type === 'DueBill' ? bills : accounts).map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      ) : (
        row.name
      )}
    </td>
    {/* Pay Date */}
    <td
      style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
      onDoubleClick={() => handleCellDoubleClick(row, row.type, 'pay_date', row.pay_date || '')}
    >
      {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'pay_date' ? (
        <input
          type="date"
          value={editingCell.value || ''}
          onChange={handleEditInputChange}
          onBlur={handleEditInputBlur}
          onKeyDown={handleEditInputKeyDown}
          autoFocus
          className="input input-bordered"
          disabled={savingEdit}
        />
      ) : (
        row.pay_date ? formatDate(row.pay_date) : '-'
      )}
    </td>
    {/* Due Date */}
    <td
      style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
      onDoubleClick={() => handleCellDoubleClick(row, row.type, 'due_date', row.due_date)}
    >
      {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'due_date' ? (
        <input
          type="date"
          value={editingCell.value}
          onChange={handleEditInputChange}
          onBlur={handleEditInputBlur}
          onKeyDown={handleEditInputKeyDown}
          autoFocus
          className="input input-bordered"
          disabled={savingEdit}
        />
      ) : (
        formatDate(row.due_date)
      )}
    </td>
    {/* Status */}
    <td
      style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
      onDoubleClick={() => handleCellDoubleClick(row, row.type, 'status', row.statusObj?.id || '')}
    >
      {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'status' ? (
        <select
          value={editingCell.value}
          onChange={handleEditInputChange}
          onBlur={handleEditInputBlur}
          onKeyDown={handleEditInputKeyDown}
          autoFocus
          className="input input-bordered"
          disabled={savingEdit}
        >
          <option value="">Select status</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      ) : (
        row.statusObj?.name || '-'
      )}
    </td>
    {/* Account */}
    <td
      style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
      onDoubleClick={() => handleCellDoubleClick(row, row.type, 'account', row.accountObj?.id || '')}
    >
      {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'account' ? (
        <select
          value={editingCell.value}
          onChange={handleEditInputChange}
          onBlur={handleEditInputBlur}
          onKeyDown={handleEditInputKeyDown}
          autoFocus
          className="input input-bordered"
          disabled={savingEdit}
        >
          <option value="">Select account</option>
          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
        </select>
      ) : (
        row.accountObj?.name || '-'
      )}
    </td>
    {/* Amount/Balance */}
    <td
      style={{
        ...(row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}),
        textAlign: 'right',
      }}
      onDoubleClick={() => handleCellDoubleClick(row, row.type, row.type === 'DueBill' ? 'amount_due' : 'balance', row.type === 'DueBill' ? row.amount_due : row.balance)}
    >
      {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === (row.type === 'DueBill' ? 'amount_due' : 'balance') ? (
        <input
          type="number"
          value={editingCell.value}
          onChange={handleEditInputChange}
          onBlur={handleEditInputBlur}
          onKeyDown={handleEditInputKeyDown}
          autoFocus
          className="input input-bordered"
          disabled={savingEdit}
        />
      ) : (
        formatCurrency(row.type === 'DueBill' ? row.amount_due : row.balance)
      )}
    </td>
  </tr>
);

export default MainTableRow; 