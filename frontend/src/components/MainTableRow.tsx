import React, { useRef, useState } from 'react';
import { Bill, BankAccount, Status } from '../types';
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
  onStatusChange: (row: { id: number; type: 'DueBill' | 'BankAccountInstance' }, statusId: number) => void | Promise<unknown>;
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
  onStatusChange,
}) => {
  const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);
  const [hoverStatusId, setHoverStatusId] = useState<number | null>(null);
  const statusRequest = useRef(0);
  const shownStatusId = pendingStatusId != null && pendingStatusId !== row.status
    ? pendingStatusId
    : (row.status ?? null);
  const shownStatus = statuses.find(status => status.id === shownStatusId) ?? row.statusObj;
  const labelStatus = (hoverStatusId != null
    ? statuses.find(status => status.id === hoverStatusId)
    : undefined) ?? shownStatus;

  const applyStatus = (statusId: number) => {
    if (statusId === shownStatusId) return;
    const request = ++statusRequest.current;
    setPendingStatusId(statusId);
    setHoverStatusId(null);
    void Promise.resolve(onStatusChange({ id: row.id, type: row.type }, statusId)).catch(() => {
      if (statusRequest.current === request) setPendingStatusId(null);
    });
  };

  // Calculate font color based on status
  const getFontColor = () => {
    if (shownStatus?.highlight_color) {
      // If status is "estimated", use the account's font color or default
      if (shownStatus.name.toLowerCase() === 'estimated') {
        return row.accountObj?.font_color || undefined;
      }
      // For other statuses, use complementary color of highlight color
      return getComplementaryColor(shownStatus.highlight_color);
    }
    
    // Fallback to account font color if no status highlight color
    if (row.accountObj?.font_color) {
      return row.accountObj.font_color;
    }
    
    return undefined;
  };

  const fontColor = getFontColor();
  const backgroundColor = shownStatus?.highlight_color || undefined;

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
      <td style={row.type === 'BankAccountInstance' ? { fontWeight: 'bold' } : {}}>
        <div className="flex flex-wrap items-center gap-1">
          <span>{labelStatus?.name || '-'}</span>
          <div role="radiogroup" aria-label={`Status for ${row.name}`} className="flex items-center gap-px">
            {statuses.map(status => {
              const selected = status.id === shownStatusId;
              return (
                <button
                  key={status.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={status.name}
                  title={status.name}
                  onMouseDown={event => event.preventDefault()}
                  onMouseEnter={() => setHoverStatusId(status.id)}
                  onMouseLeave={() => setHoverStatusId(current => current === status.id ? null : current)}
                  onFocus={() => setHoverStatusId(status.id)}
                  onBlur={() => setHoverStatusId(current => current === status.id ? null : current)}
                  onClick={event => {
                    event.stopPropagation();
                    applyStatus(status.id);
                  }}
                  className="inline-flex h-3.5 w-3.5 shrink-0 cursor-pointer rounded-sm border border-current p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    backgroundColor: status.highlight_color,
                    outline: selected ? '2px solid currentColor' : undefined,
                    outlineOffset: selected ? '1px' : undefined,
                  }}
                />
              );
            })}
          </div>
        </div>
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
      <td className="w-px text-center">
        <button
          type="button"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-black/15 bg-white text-red-600 shadow-sm hover:border-red-600 hover:bg-red-600 hover:text-white"
          onClick={() => onDelete(row.type, row.id)}
          aria-label="Delete"
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default MainTableRow; 