import { useState } from 'react';
import AddBillModal from './components/AddBillModal';
import EditBillModal from './components/EditBillModal';
import useBills from './hooks/useBills';
import useBankAccounts from './hooks/useBankAccounts';
import useCategories from './hooks/useCategories';
import useRecurrences from './hooks/useRecurrences';

// Bills management page for Budg SPA

interface Bill {
  id: number;
  name: string;
  default_amount_due: string;
  url: string;
  draft_account: number;
  category: number;
  recurrence: number;
  priority: number;
}

interface BillsPageProps {
  token: string;
}

const BillsPage = ({ token }: BillsPageProps) => {
  const { bills, loading, error, refresh: refreshBills } = useBills(token);
  const { accounts } = useBankAccounts(token);
  const { categories } = useCategories(token);
  const { recurrences } = useRecurrences(token);
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
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount Due</th>
                <th>URL</th>
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
                  <td>{bill.url ? <a href={bill.url} target="_blank" rel="noopener noreferrer" className="link link-primary">{bill.url}</a> : '-'}</td>
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
          bill={editBill}
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