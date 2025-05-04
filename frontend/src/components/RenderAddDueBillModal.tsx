import React from 'react';
import AddDueBillModal from './AddDueBillModal';
import { Bill, Recurrence, BankAccount, Status } from '../types';

interface RenderAddDueBillModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  form: {
    bill: string;
    recurrence: string;
    amount_due: string;
    draft_account: string;
    due_date: string;
    pay_date: string;
    status: string;
    priority: string;
  };
  error: string | null;
  loading: boolean;
  bills: Bill[];
  recurrences: Recurrence[];
  accounts: BankAccount[];
  statuses: Status[];
  onAddBill?: () => void;
  onAddRecurrence?: () => void;
  onAddAccount?: () => void;
  onAddStatus?: () => void;
}

const RenderAddDueBillModal: React.FC<RenderAddDueBillModalProps> = (props) => {
  if (!props.show) return null;
  return <AddDueBillModal {...props} />;
};

export default RenderAddDueBillModal; 