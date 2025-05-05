import React from 'react';
import MainTableRow from './MainTableRow';
import SubtotalRow from './SubtotalRow';
import { DueBill, BankAccountInstance, BankAccount, Bill, Status } from '../types';

interface MainTableBodyProps {
  dueBills: DueBill[];
  bankInstances: BankAccountInstance[];
  accounts: BankAccount[];
  bills: Bill[];
  statuses: Status[];
  editingCell: {
    rowId: number;
    type: 'DueBill' | 'BankAccountInstance';
    field: string;
    value: string | number;
  } | null;
  savingEdit: boolean;
  handleCellDoubleClick: (row: unknown, type: 'DueBill' | 'BankAccountInstance', field: string, value: string | number) => void;
  handleEditInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleEditInputBlur: () => void;
  handleEditInputKeyDown: (e: React.KeyboardEvent) => void;
  onDelete: (type: 'DueBill' | 'BankAccountInstance', id: number) => void;
  onAddBill: () => void;
  onAddAccount: () => void;
  onAddStatus: () => void;
}

const MainTableBody: React.FC<MainTableBodyProps> = ({
  dueBills,
  bankInstances,
  accounts,
  bills,
  statuses,
  editingCell,
  savingEdit,
  handleCellDoubleClick,
  handleEditInputChange,
  handleEditInputBlur,
  handleEditInputKeyDown,
  onDelete,
  onAddBill,
  onAddAccount,
  onAddStatus,
}) => {
  const renderedRows: React.ReactNode[] = [];

  // Group due bills and bank instances by account
  const dueBillsByAccount: Record<number, DueBill[]> = {};
  dueBills.forEach(db => {
    if (db.draft_account != null) {
      if (!dueBillsByAccount[db.draft_account]) dueBillsByAccount[db.draft_account] = [];
      dueBillsByAccount[db.draft_account].push(db);
    }
  });
  const bankInstancesByAccount: Record<number, BankAccountInstance[]> = {};
  bankInstances.forEach(bi => {
    if (bi.bank_account != null) {
      if (!bankInstancesByAccount[bi.bank_account]) bankInstancesByAccount[bi.bank_account] = [];
      bankInstancesByAccount[bi.bank_account].push(bi);
    }
  });

  // Build all groups for all accounts
  type Group = { payDate: string; rows: React.ReactNode[] };
  const allGroups: Group[] = [];

  accounts.forEach(account => {
    const accountId = account.id;
    const accountInstances = (bankInstancesByAccount[accountId] || []).slice().sort((a, b) => (a.pay_date || '').localeCompare(b.pay_date || ''));
    const accountDueBills = (dueBillsByAccount[accountId] || []).slice().sort((a, b) => (a.pay_date || '').localeCompare(b.pay_date || ''));
    const usedDueBillIds = new Set<number>();

    // For each account instance, find due bills in its date range
    for (let i = 0; i < accountInstances.length; i++) {
      const instance = accountInstances[i];
      const nextInstance = accountInstances[i + 1];
      const start = instance.pay_date || '';
      const end = nextInstance ? (nextInstance.pay_date || '') : null;
      const groupRows: React.ReactNode[] = [];
      // Render account instance row
      groupRows.push(
        <MainTableRow
          key={`BankAccountInstance-${instance.id}`}
          row={{ ...instance, type: 'BankAccountInstance', name: account.name, accountObj: account, accountId: account.id, statusObj: statuses.find(s => s.id === instance.status) }}
          editingCell={editingCell}
          savingEdit={savingEdit}
          handleCellDoubleClick={handleCellDoubleClick}
          handleEditInputChange={handleEditInputChange}
          handleEditInputBlur={handleEditInputBlur}
          handleEditInputKeyDown={handleEditInputKeyDown}
          bills={bills}
          accounts={accounts}
          statuses={statuses}
          onDelete={onDelete}
          onAddBill={onAddBill}
          onAddAccount={onAddAccount}
          onAddStatus={onAddStatus}
        />
      );
      // Find due bills in this range
      let dueBillsInRange = accountDueBills.filter(db => {
        if (!db.pay_date) return false;
        if (db.pay_date < start) return false;
        if (end && db.pay_date >= end) return false;
        return true;
      });
      // Sort by pay_date, then priority, then due_date
      dueBillsInRange = dueBillsInRange.slice().sort((a, b) => {
        const aPay = a.pay_date || '';
        const bPay = b.pay_date || '';
        if (aPay !== bPay) return aPay.localeCompare(bPay);
        const aPriority = a.priority ?? 0;
        const bPriority = b.priority ?? 0;
        if (aPriority !== bPriority) return aPriority - bPriority;
        const aDue = a.due_date || '';
        const bDue = b.due_date || '';
        return aDue.localeCompare(bDue);
      });
      // Render due bills
      dueBillsInRange.forEach(db => {
        groupRows.push(
          <MainTableRow
            key={`DueBill-${db.id}`}
            row={{ ...db, type: 'DueBill', name: bills.find(b => b.id === db.bill)?.name || 'Unknown', accountObj: account, accountId: account.id, statusObj: statuses.find(s => s.id === db.status) }}
            editingCell={editingCell}
            savingEdit={savingEdit}
            handleCellDoubleClick={handleCellDoubleClick}
            handleEditInputChange={handleEditInputChange}
            handleEditInputBlur={handleEditInputBlur}
            handleEditInputKeyDown={handleEditInputKeyDown}
            bills={bills}
            accounts={accounts}
            statuses={statuses}
            onDelete={onDelete}
            onAddBill={onAddBill}
            onAddAccount={onAddAccount}
            onAddStatus={onAddStatus}
          />
        );
        usedDueBillIds.add(db.id);
      });
      // Subtotal for this group
      const sumDue = dueBillsInRange.reduce((sum, db) => sum + parseFloat(db.amount_due), 0);
      groupRows.push(
        <SubtotalRow
          key={`subtotal-${accountId}-${instance.id}`}
          rowKey={`subtotal-${accountId}-${instance.id}`}
          subtotal={sumDue}
          accountName={account.name}
          fontColor={account.font_color}
        />
      );
      allGroups.push({ payDate: start, rows: groupRows });
    }
    // Catch-all group: due bills not in any instance's range
    let catchAllDueBills = accountDueBills.filter(db => !usedDueBillIds.has(db.id));
    // Sort by pay_date, then priority, then due_date
    catchAllDueBills = catchAllDueBills.slice().sort((a, b) => {
      const aPay = a.pay_date || '';
      const bPay = b.pay_date || '';
      if (aPay !== bPay) return aPay.localeCompare(bPay);
      const aPriority = a.priority ?? 0;
      const bPriority = b.priority ?? 0;
      if (aPriority !== bPriority) return aPriority - bPriority;
      const aDue = a.due_date || '';
      const bDue = b.due_date || '';
      return aDue.localeCompare(bDue);
    });
    if (catchAllDueBills.length > 0) {
      const groupRows: React.ReactNode[] = [];
      catchAllDueBills.forEach(db => {
        groupRows.push(
          <MainTableRow
            key={`DueBill-catchall-${db.id}`}
            row={{ ...db, type: 'DueBill', name: bills.find(b => b.id === db.bill)?.name || 'Unknown', accountObj: account, accountId: account.id, statusObj: statuses.find(s => s.id === db.status) }}
            editingCell={editingCell}
            savingEdit={savingEdit}
            handleCellDoubleClick={handleCellDoubleClick}
            handleEditInputChange={handleEditInputChange}
            handleEditInputBlur={handleEditInputBlur}
            handleEditInputKeyDown={handleEditInputKeyDown}
            bills={bills}
            accounts={accounts}
            statuses={statuses}
            onDelete={onDelete}
            onAddBill={onAddBill}
            onAddAccount={onAddAccount}
            onAddStatus={onAddStatus}
          />
        );
      });
      const sumDue = catchAllDueBills.reduce((sum, db) => sum + parseFloat(db.amount_due), 0);
      groupRows.push(
        <SubtotalRow
          key={`subtotal-${accountId}-catchall`}
          rowKey={`subtotal-${accountId}-catchall`}
          subtotal={sumDue}
          accountName={account.name}
          fontColor={account.font_color}
        />
      );
      // Use a payDate that will always sort last (e.g., '9999-12-31')
      allGroups.push({ payDate: '9999-12-31', rows: groupRows });
    }
  });

  // Sort all groups by payDate
  allGroups.sort((a, b) => a.payDate.localeCompare(b.payDate));
  // Render all groups in global order
  allGroups.forEach(group => {
    renderedRows.push(...group.rows);
  });

  return <>{renderedRows}</>;
};

export default MainTableBody; 