import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';

function Submissions() {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProcess, setFilterProcess] = useState('All');
  const [filterText, setFilterText] = useState('');
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'work_submissions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  const getFilteredRequests = () => {
    return requests.filter(r => {
      const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
      const matchesProcess = filterProcess === 'All' || r.processName === filterProcess;
      const matchesText = filterText === '' || 
        r.title?.toLowerCase().includes(filterText.toLowerCase()) || 
        r.processName?.toLowerCase().includes(filterText.toLowerCase());
      return matchesStatus && matchesProcess && matchesText;
    });
  };

  const uniqueProcesses = [...new Set(requests.map(r => r.processName))].filter(p => p);
  const statuses = ['All', 'Pending', 'Approved'];
  const filteredRequests = getFilteredRequests();

  const handleApprove = async (id) => {
    const rating = ratings[id];
    if (!rating) {
      alert('Please select a rating before approving');
      return;
    }
    await updateDoc(doc(db, 'work_submissions', id), {
      rating: Number(rating),
      status: 'Approved',
      approvedAt: new Date().toLocaleString()
    });
    setRatings({ ...ratings, [id]: '' });
    alert('Submission approved with ' + rating + ' stars!');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this submission permanently?')) {
      await deleteDoc(doc(db, 'work_submissions', id));
      alert('Submission deleted');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Search & Filter</h2>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <input
            type="text"
            className="filter-input"
            placeholder="Search by title or process..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            {statuses.map(status => status !== 'All' && <option key={status} value={status}>{status}</option>)}
          </select>
          <select
            className="filter-select"
            value={filterProcess}
            onChange={(e) => setFilterProcess(e.target.value)}
          >
            <option value="All">All Processes</option>
            {uniqueProcesses.map(process => <option key={process} value={process}>{process}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>All Submissions ({filteredRequests.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Process</th>
              <th>Work Title</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.processName}</strong></td>
                  <td>{r.title}</td>
                  <td style={{fontSize: '0.9em'}}>{r.submittedAt}</td>
                  <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  <td>{r.rating > 0 ? `${r.rating}/5` : '-'}</td>
                  <td>
                    {r.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select 
                          className="filter-select" 
                          value={ratings[r.id] || ''} 
                          onChange={(e) => setRatings({ ...ratings, [r.id]: e.target.value })}
                          style={{ padding: '0.5rem', minWidth: '100px' }}
                        >
                          <option value="">Select rating...</option>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                        </select>
                        <button className="btn approve-btn" onClick={() => handleApprove(r.id)}>
                          Approve
                        </button>
                        <button className="btn delete-btn" onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                    {r.status === 'Approved' && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{color: '#28a745', fontWeight: 'bold'}}>✓ Approved</span>
                        <button className="btn delete-btn" onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No submissions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Submissions;
