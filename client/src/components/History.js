import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function History({ user }) {
  const [workHistory, setWorkHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '' });

  useEffect(() => {
    const q = query(collection(db, "work_submissions"), where("inchargeId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setWorkHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));    
    });
    return () => unsub();
  }, [user.uid]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this submission?')) {
      const item = workHistory.find(w => w.id === id);
      if (item.status === 'Approved') {
        alert('Cannot delete approved submissions');
        return;
      }
      await deleteDoc(doc(db, "work_submissions", id));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({ title: item.title, description: item.description });
  };

  const handleSaveEdit = async () => {
    if (!editData.title.trim() || !editData.description.trim()) {
      alert('Please fill all fields');
      return;
    }
    await updateDoc(doc(db, "work_submissions", editingId), editData);
    setEditingId(null);
    alert('Submission updated!');
  };

  return (
    <div className="dashboard">
      <h3>My Submission</h3>
      <div style={{overflowX: 'auto'}}>
        <table>
          <thead>
            <tr>
              <th>Work Title</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workHistory.length > 0 ? (
              workHistory.map(item => (
                editingId === item.id ? (
                  <tr key={item.id}>
                    <td colSpan="5">
                      <div style={{padding: '1rem', background: '#f9f9f9'}}>
                        <h4 style={{marginTop: 0}}>Edit Submission</h4>
                        <input 
                          placeholder="Title" 
                          value={editData.title}
                          onChange={(e) => setEditData({...editData, title: e.target.value})}
                        />
                        <textarea 
                          placeholder="Description" 
                          value={editData.description}
                          onChange={(e) => setEditData({...editData, description: e.target.value})}
                        />
                        <div style={{marginTop: '0.5rem', gap: '0.5rem', display: 'flex'}}>
                          <button className="btn" onClick={handleSaveEdit}>Save</button>
                          <button className="btn" style={{background: '#999'}} onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td style={{fontSize: '0.9em'}}>{item.submittedAt}</td>
                    <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                    <td>{item.rating > 0 ? `${item.rating}/5` : '-'}</td>
                    <td>
                      {item.status === 'Pending' && (
                        <>
                          <button className="btn" style={{fontSize: '0.85rem', padding: '0.4rem 0.8rem', marginRight: '0.3rem'}} onClick={() => handleEdit(item)}>Edit</button>
                          <button className="btn" style={{fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: '#dc3545'}} onClick={() => handleDelete(item.id)}>Delete</button>
                        </>
                      )}
                      {item.status === 'Approved' && (
                        <span style={{color: '#28a745', fontWeight: 'bold', marginRight: '0.5rem'}}>✓ Approved</span>
                      )}
                    </td>
                  </tr>
                )
              ))
            ) : (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#999'}}>No submissions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;
