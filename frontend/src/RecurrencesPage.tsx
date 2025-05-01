import { useEffect, useState } from 'react';
import axios from 'axios';

// Recurrences management page for Budg SPA

interface Recurrence {
  id: number;
  name: string;
  interval: string;
}

interface RecurrencesPageProps {
  token: string;
}

const RecurrencesPage = ({ token }: RecurrencesPageProps) => {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editRecurrence, setEditRecurrence] = useState<Recurrence | null>(null);
  const [form, setForm] = useState({ name: '', interval: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get('/api/recurrences/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setRecurrences(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch recurrences');
        setLoading(false);
      });
  }, [token]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    const req = editRecurrence
      ? axios.put(`/api/recurrences/${editRecurrence.id}/`, form, { headers: { Authorization: `Bearer ${token}` } })
      : axios.post('/api/recurrences/', form, { headers: { Authorization: `Bearer ${token}` } });
    req.then(() => {
      setShowModal(false);
      setEditRecurrence(null);
      setForm({ name: '', interval: '' });
      setFormLoading(false);
      setLoading(true);
      axios.get('/api/recurrences/', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setRecurrences(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    })
      .catch(() => {
        setFormError('Failed to save recurrence');
        setFormLoading(false);
      });
  };
  const handleEdit = (recurrence: Recurrence) => {
    setEditRecurrence(recurrence);
    setForm({ name: recurrence.name, interval: recurrence.interval });
    setShowModal(true);
  };
  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this recurrence?')) return;
    setLoading(true);
    axios.delete(`/api/recurrences/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setRecurrences(recurrences.filter(r => r.id !== id));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to delete recurrence');
        setLoading(false);
      });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Recurrences</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setEditRecurrence(null); setForm({ name: '', interval: '' }); }}>Add Recurrence</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-error mb-2">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow mb-2">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Interval</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recurrences.map(recurrence => (
                <tr key={recurrence.id}>
                  <td>{recurrence.name}</td>
                  <td>{recurrence.interval}</td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-info mr-2" onClick={() => handleEdit(recurrence)}>Edit</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDelete(recurrence.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Recurrence Modal */}
      {showModal && (
        <div className="modal modal-open z-50" onClick={() => setShowModal(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">{editRecurrence ? 'Edit Recurrence' : 'Add Recurrence'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input name="name" value={form.name} onChange={handleFormChange} required className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Interval</span>
                </label>
                <input name="interval" value={form.interval} onChange={handleFormChange} className="input input-bordered" />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={formLoading} className="btn btn-primary w-full">{editRecurrence ? 'Save' : 'Add'}</button>
              </div>
              {formError && <div className="text-error text-center">{formError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrencesPage; 