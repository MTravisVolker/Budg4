import { useEffect, useState } from 'react';
import axios from 'axios';

// Statuses management page for Budg SPA

interface Status {
  id: number;
  name: string;
  highlight_color: string;
}

interface StatusesPageProps {
  token: string;
}

const StatusesPage = ({ token }: StatusesPageProps) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editStatus, setEditStatus] = useState<Status | null>(null);
  const [statusForm, setStatusForm] = useState({ name: '', highlight_color: '' });
  const [statusFormError, setStatusFormError] = useState<string | null>(null);
  const [statusFormLoading, setStatusFormLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setStatusLoading(true);
    axios.get('/api/statuses/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setStatuses(res.data);
        setStatusLoading(false);
      })
      .catch(() => {
        setStatusError('Failed to fetch statuses');
        setStatusLoading(false);
      });
  }, [token]);

  const handleStatusFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusForm({ ...statusForm, [e.target.name]: e.target.value });
  };
  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusFormError(null);
    setStatusFormLoading(true);
    const req = editStatus
      ? axios.put(`/api/statuses/${editStatus.id}/`, statusForm, { headers: { Authorization: `Bearer ${token}` } })
      : axios.post('/api/statuses/', statusForm, { headers: { Authorization: `Bearer ${token}` } });
    req.then(() => {
      setShowStatusModal(false);
      setEditStatus(null);
      setStatusForm({ name: '', highlight_color: '' });
      setStatusFormLoading(false);
      setStatusLoading(true);
      axios.get('/api/statuses/', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setStatuses(res.data);
          setStatusLoading(false);
        })
        .catch(() => setStatusLoading(false));
    })
      .catch(() => {
        setStatusFormError('Failed to save status');
        setStatusFormLoading(false);
      });
  };
  const handleEditStatus = (status: Status) => {
    setEditStatus(status);
    setStatusForm({ name: status.name, highlight_color: status.highlight_color });
    setShowStatusModal(true);
  };
  const handleDeleteStatus = (id: number) => {
    if (!window.confirm('Delete this status?')) return;
    setStatusLoading(true);
    axios.delete(`/api/statuses/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setStatuses(statuses.filter(s => s.id !== id));
        setStatusLoading(false);
      })
      .catch(() => {
        setStatusError('Failed to delete status');
        setStatusLoading(false);
      });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Statuses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowStatusModal(true); setEditStatus(null); setStatusForm({ name: '', highlight_color: '' }); }}>Add Status</button>
      </div>
      {statusLoading && <div>Loading...</div>}
      {statusError && <div className="alert alert-error mb-2">{statusError}</div>}
      {!statusLoading && !statusError && (
        <div className="overflow-x-auto rounded-lg shadow mb-2">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Highlight Color</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map(status => (
                <tr key={status.id}>
                  <td>{status.name}</td>
                  <td><span style={{ background: status.highlight_color, padding: '0.2em 0.8em', borderRadius: '4px', color: '#fff' }}>{status.highlight_color}</span></td>
                  <td>
                    <button className="btn btn-xs btn-outline btn-info mr-2" onClick={() => handleEditStatus(status)}>Edit</button>
                    <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDeleteStatus(status.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Status Modal */}
      {showStatusModal && (
        <div className="modal modal-open z-50" onClick={() => setShowStatusModal(false)}>
          <div className="modal-box w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowStatusModal(false)}
              aria-label="Close"
            >✕</button>
            <h2 className="font-bold text-xl mb-4">{editStatus ? 'Edit Status' : 'Add Status'}</h2>
            <form onSubmit={handleStatusSubmit} className="flex flex-col gap-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input name="name" value={statusForm.name} onChange={handleStatusFormChange} required className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Highlight Color</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="highlight_color"
                    type="color"
                    value={statusForm.highlight_color || '#000000'}
                    onChange={handleStatusFormChange}
                    className="input input-bordered w-12 h-12 p-0 border-none bg-transparent"
                    style={{ minWidth: '3rem' }}
                  />
                  <input
                    name="highlight_color"
                    type="text"
                    value={statusForm.highlight_color}
                    onChange={handleStatusFormChange}
                    placeholder="#000000"
                    className="input input-bordered w-32"
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={statusFormLoading} className="btn btn-primary w-full">{editStatus ? 'Save' : 'Add'}</button>
              </div>
              {statusFormError && <div className="text-error text-center">{statusFormError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusesPage; 