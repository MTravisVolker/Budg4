export interface DueBill {
  id: number;
  bill: number; // Bill id
  recurrence: number | null;
  amount_due: string;
  total_balance: string;
  draft_account: number | null;
  due_date: string;
  pay_date: string | null;
  status: number | null;
  priority: number;
}

export interface BankAccountInstance {
  id: number;
  bank_account: number;
  balance: string;
  total_balance: string;
  due_date: string;
  pay_date: string | null;
  status: number | null;
  priority: number;
}

export interface BankAccount {
  id: number;
  name: string;
  font_color: string;
  url?: string;
}

export interface Bill {
  id: number;
  name: string;
  default_amount_due: string;
  total_balance: string;
  url: string;
  draft_account: number | null;
  category: number | null;
  recurrence: number | null;
  priority: number;
}

export interface Status {
  id: number;
  name: string;
  highlight_color: string;
}

export interface Recurrence {
  id: number;
  name: string;
  calculation?: string;
} 