import React from 'react';
import MainTableRow from './MainTableRow';
import SubtotalRow from './SubtotalRow';
import { DueBill, BankAccountInstance, BankAccount, Bill, Status } from '../types';

interface MainTableBodyProps {
  allRowsRaw: any[];
  dueBills: DueBill[];
  bankInstances: BankAccountInstance[];
  accounts: BankAccount[];
  bills: Bill[];
  statuses: Status[];
  editingCell: any;
  savingEdit: boolean;
  handleCellDoubleClick: (row: any, type: 'DueBill' | 'BankAccountInstance', field: string, value: string | number) => void;
  handleEditInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleEditInputBlur: () => void;
  handleEditInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onDelete: (type: 'DueBill' | 'BankAccountInstance', id: number) => void;
  onAddBill: () => void;
  onAddAccount: () => void;
  onAddStatus: () => void;
}

const MainTableBody: React.FC<MainTableBodyProps> = ({
  allRowsRaw,
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
  const subtotalInsertedForAccount: Record<number, boolean> = {};
  const dueBillsByAccount: Record<number, typeof dueBills> = {};
  dueBills.forEach((db) => {
    const draftAccount: number | undefined = db.draft_account === null ? undefined : db.draft_account;
    if (typeof draftAccount === 'number') {
      if (!dueBillsByAccount[draftAccount]) dueBillsByAccount[draftAccount] = [];
      dueBillsByAccount[draftAccount].push(db);
    }
  });
  const bankInstancesByAccount: Record<number, typeof bankInstances> = {};
  bankInstances.forEach((bi) => {
    const bankAccount: number | undefined = bi.bank_account === null ? undefined : bi.bank_account;
    if (typeof bankAccount === 'number') {
      if (!bankInstancesByAccount[bankAccount]) bankInstancesByAccount[bankAccount] = [];
      bankInstancesByAccount[bankAccount].push(bi);
    }
  });
  const renderedDueBillIds = new Set<number>();
  for (let i = 0; i < allRowsRaw.length; i++) {
    const r = allRowsRaw[i];
    const isBankInstance = r.type === 'BankAccountInstance';
    const isDueBill = r.type === 'DueBill';
    renderedRows.push(
      <MainTableRow
        key={r.type + '-' + r.id}
        row={r}
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
    if (isDueBill) {
      renderedDueBillIds.add(r.id);
    }
    if (isBankInstance) {
      const accountId: number | undefined = r.accountId === null ? undefined : r.accountId;
      if (typeof accountId === 'number') {
        const thisPayDate = r.pay_date || '';
        const accountBankInstances = bankInstancesByAccount[accountId] || [];
        const thisIndex = accountBankInstances.findIndex((bi) => bi.id === r.id);
        const nextInstance = accountBankInstances[thisIndex + 1];
        const nextPayDate = nextInstance ? nextInstance.pay_date || '' : null;
        const dueBillsInRange = (dueBillsByAccount[accountId] || []).filter((db) => {
          if (!db.pay_date) return false;
          if (db.pay_date < thisPayDate) return false;
          if (nextPayDate && db.pay_date >= nextPayDate) return false;
          return true;
        });
        const sumDue = dueBillsInRange.reduce((sum: number, db) => sum + parseFloat(db.amount_due), 0);
        const subtotal = parseFloat(r.balance) - sumDue;
        renderedRows.push(
          <SubtotalRow
            key={`subtotal-${accountId}-${r.id}`}
            rowKey={`subtotal-${accountId}-${r.id}`}
            subtotal={subtotal}
            accountName={accounts.find(a => a.id === accountId)?.name || 'Unknown'}
            fontColor={accounts.find(a => a.id === accountId)?.font_color}
          />
        );
      }
    }
    const nextRow = allRowsRaw[i + 1];
    const accountId: number | undefined = r.accountId === null ? undefined : r.accountId;
    const isLastForAccount = typeof accountId === 'number' && (!nextRow || nextRow.accountId !== accountId);
    if (isLastForAccount && typeof accountId === 'number' && !subtotalInsertedForAccount[accountId]) {
      const accountDueBills = (dueBillsByAccount[accountId] || []).filter((db) => db.pay_date && !renderedDueBillIds.has(db.id));
      if (accountDueBills.length > 0) {
        const sumDue = accountDueBills.reduce((sum: number, db) => sum + parseFloat(db.amount_due), 0);
        renderedRows.push(
          <SubtotalRow
            key={`subtotal-${accountId}-noinstance`}
            rowKey={`subtotal-${accountId}-noinstance`}
            subtotal={-sumDue}
            accountName={accounts.find(a => a.id === accountId)?.name || 'Unknown'}
            fontColor={accounts.find(a => a.id === accountId)?.font_color}
          />
        );
      }
      subtotalInsertedForAccount[accountId] = true;
    }
  }
  return <>{renderedRows}</>;
};

export default MainTableBody; 