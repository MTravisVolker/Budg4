import { useState } from 'react';
import AddBillModal from './components/AddBillModal';
import EditBillModal from './components/EditBillModal';
import useBills from './hooks/useBills';
import useBankAccounts from './hooks/useBankAccounts';
import useCategories from './hooks/useCategories';
import useRecurrences from './hooks/useRecurrences';
import { Bill } from './types';

// Bills management page for Budg SPA

interface BillsPageProps {
  token: string;
}

const BillsPage = ({ token }: BillsPageProps) => {
  const { bills, loading, error, refresh: refreshBills } = useBills(token);
  const { accounts, error: accountsError } = useBankAccounts(token);
  const { categories, error: categoriesError } = useCategories(token);
  const { recurrences, error: recurrencesError } = useRecurrences(token);
  const relatedError = accountsError || categoriesError || recurrencesError;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDeleteBill = () => {
    if (!window.confirm('Delete this bill?')) return;
    refreshBills();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Bills Table</h1>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">Add Bill</button>
      </div>
      {loading && <div className="flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>}
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {!error && relatedError && <div className="alert alert-error mb-4">{relatedError}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount Due</th>
                <th className="max-w-[500px]">URL</th>
                <th>Draft Account</th>
                <th>Category</th>
                <th>Recurrence</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td>{bill.name}</td>
                  <td>{bill.default_amount_due}</td>
                  <td className="max-w-[500px] break-all">{bill.url ? <a href={bill.url} target="_blank" rel="noopener noreferrer" className="link link-primary">{bill.url}</a> : '-'}</td>
                  <td>{accounts.find(acc => acc.id === bill.draft_account)
                    ? <span style={{ color: accounts.find(acc => acc.id === bill.draft_account)?.font_color || undefined, fontWeight: 'bold' }}>
                        {accounts.find(acc => acc.id === bill.draft_account)?.name}
                      </span>
                    : '-'}</td>
                  <td>{categories.find(cat => cat.id === bill.category)?.name ?? '-'}</td>
                  <td>{recurrences.find(rec => rec.id === bill.recurrence)?.name ?? '-'}</td>
                  <td>{bill.priority}</td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-info mr-2" onClick={() => {
                      setEditBill(bill);
                      setShowEditModal(true);
                    }}>Edit</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={handleDeleteBill}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showAddModal && (
        <AddBillModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          token={token}
          accounts={accounts}
          categories={categories}
          recurrences={recurrences}
          onAdded={refreshBills}
        />
      )}
      {showEditModal && editBill && (
        <EditBillModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditBill(null);
          }}
          token={token}
          bill={{
            id: editBill.id,
            name: editBill.name,
            default_amount_due: parseFloat(editBill.default_amount_due),
            total_balance: editBill.total_balance ? parseFloat(editBill.total_balance) : undefined,
            url: editBill.url,
            draft_account: editBill.draft_account === null ? undefined : editBill.draft_account,
            category: editBill.category === null ? undefined : editBill.category,
            recurrence: editBill.recurrence === null ? undefined : editBill.recurrence,
            priority: editBill.priority
          }}
          accounts={accounts}
          categories={categories}
          recurrences={recurrences}
          onSaved={refreshBills}
        />
      )}
    </div>
  );
};

export default BillsPage; 