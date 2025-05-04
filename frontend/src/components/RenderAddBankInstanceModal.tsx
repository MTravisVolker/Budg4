import React from 'react';
import AddBankInstanceModal from './AddBankInstanceModal';
import { BankAccount, Status } from '../types';

interface RenderAddBankInstanceModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  form: {
    bank_account: string;
    balance: string;
    due_date: string;
    pay_date: string;
    status: string;
    priority?: string;
  };
  error: string | null;
  loading: boolean;
  accounts: BankAccount[];
  statuses: Status[];
  onAddAccount?: () => void;
  onAddStatus?: () => void;
}

const RenderAddBankInstanceModal: React.FC<RenderAddBankInstanceModalProps> = (props) => {
  if (!props.show) return null;
  return <AddBankInstanceModal {...props} />;
};

export default RenderAddBankInstanceModal; 