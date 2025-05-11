import React from 'react';
import { DueBill, BankAccountInstance, Bill, BankAccount, Status } from '../types';
import { formatDate, formatCurrency } from '../utils/format';
import { getComplementaryColor } from '../utils/color';

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
  onDelete: (type: 'DueBill' | 'BankAccountInstance', id: number) => void;
  onAddBill?: () => void;
  onAddAccount?: () => void;
  onAddStatus?: () => void;
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
  onDelete,
  onAddBill,
  onAddAccount,
  onAddStatus,
}) => {
  // Calculate font color based on status
  const getFontColor = () => {
    // Debug info as a comment in the DOM
    const debugInfo = {
      accountFontColor: row.accountObj?.font_color,
      statusName: row.statusObj?.name,
      highlightColor: row.statusObj?.highlight_color,
      hasAccountObj: !!row.accountObj,
      hasStatusObj: !!row.statusObj
    };

    if (row.statusObj?.highlight_color) {
      // If status is "estimated", use the account's font color or default
      if (row.statusObj.name.toLowerCase() === 'estimated') {
        return row.accountObj?.font_color || undefined;
      }
      // For other statuses, use complementary color of highlight color
      return getComplementaryColor(row.statusObj.highlight_color);
    }
    
    // Fallback to account font color if no status highlight color
    if (row.accountObj?.font_color) {
      return row.accountObj.font_color;
    }
    
    return undefined;
  };

  const fontColor = getFontColor();
  const backgroundColor = row.statusObj?.highlight_color || undefined;

  return (
    <tr
      key={row.type + '-' + row.id}
      style={{
        background: backgroundColor,
        color: fontColor,
      }}
      title={`Debug: ${JSON.stringify({
        fontColor,
        backgroundColor,
        status: row.statusObj?.name,
        account: row.accountObj?.name
      })}`}
      onClick={(e) => {
        // If we're not clicking on an input or select element, trigger blur
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
          handleEditInputBlur();
        }
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
          <div className="flex items-center gap-1">
            <select
              value={editingCell.value}
              onChange={e => {
                if (e.target.value === '__add__') {
                  row.type === 'DueBill' ? onAddBill && onAddBill() : onAddAccount && onAddAccount();
                } else {
                  handleEditInputChange(e);
                }
              }}
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
              <option value="__add__">Add new…</option>
            </select>
            <button type="button" className="btn btn-xs btn-link" onClick={row.type === 'DueBill' ? onAddBill : onAddAccount}>Add</button>
          </div>
        ) : (
          row.type === 'DueBill' ? (
            (() => {
              const bill = bills.find(b => b.id === row.bill);
              return bill?.url ? (
                <a 
                  href={bill.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {row.name}
                </a>
              ) : row.name;
            })()
          ) : (
            (() => {
              const account = accounts.find(a => a.id === row.bank_account);
              return account?.url ? (
                <a 
                  href={account.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {row.name}
                </a>
              ) : row.name;
            })()
          )
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
          <div className="flex items-center gap-1">
            <select
              value={editingCell.value}
              onChange={e => {
                if (e.target.value === '__add__') {
                  onAddStatus && onAddStatus();
                } else {
                  handleEditInputChange(e);
                }
              }}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            >
              <option value="">Select status</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
            <button type="button" className="btn btn-xs btn-link" onClick={onAddStatus}>Add</button>
          </div>
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
          <div className="flex items-center gap-1">
            <select
              value={editingCell.value}
              onChange={e => {
                if (e.target.value === '__add__') {
                  onAddAccount && onAddAccount();
                } else {
                  handleEditInputChange(e);
                }
              }}
              onBlur={handleEditInputBlur}
              onKeyDown={handleEditInputKeyDown}
              autoFocus
              className="input input-bordered"
              disabled={savingEdit}
            >
              <option value="">Select account</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              <option value="__add__">Add new…</option>
            </select>
            <button type="button" className="btn btn-xs btn-link" onClick={onAddAccount}>Add</button>
          </div>
        ) : (
          row.accountObj?.name || '-'
        )}
      </td>
      {/* Priority */}
      <td
        style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}
        onDoubleClick={() => handleCellDoubleClick(row, row.type, 'priority', row.priority)}
      >
        {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'priority' ? (
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
          typeof row.priority === 'number' ? row.priority : '-'
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
      {/* Total Balance */}
      <td
        style={{
          ...(row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}),
          textAlign: 'right',
        }}
        onDoubleClick={() => handleCellDoubleClick(row, row.type, 'total_balance', row.total_balance)}
      >
        {editingCell && editingCell.rowId === row.id && editingCell.type === row.type && editingCell.field === 'total_balance' ? (
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
          formatCurrency(row.total_balance)
        )}
      </td>
      {/* Delete Button */}
      <td>
        <button className="btn btn-error btn-xs" onClick={() => onDelete(row.type, row.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
};

export default MainTableRow; 