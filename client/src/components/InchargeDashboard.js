/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, updateDoc, doc } from 'firebase/firestore';

const InchargeDashboard = ({ user }) => {
  const [workHistory, setWorkHistory] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '' });

  useEffect(() => {
    const q = query(collection(db, "work_submissions"), where("inchargeId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setWorkHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill all fields');
      return;
    }
    await addDoc(collection(db, "work_submissions"), {
      ...formData,
      inchargeId: user.uid,
      processName: user.processName,
      status: "Pending",
      rating: 0,
      submittedAt: new Date().toLocaleString()
    });
    setFormData({ title: '', description: '' });
    alert("Process detail submitted to Admin!");
  };

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

  // Calculate stats
  const totalSubmissions = workHistory.length;
  const approvedCount = workHistory.filter(w => w.status === 'Approved').length;
  const pendingCount = workHistory.filter(w => w.status === 'Pending').length;
  const avgRating = approvedCount > 0 
    ? (workHistory.filter(w => w.status === 'Approved').reduce((sum, w) => sum + Number(w.rating), 0) / approvedCount).toFixed(2)
    : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Process: {user.processName}</h2>
        <p>Member since: {user.createdAt || "New Member"}</p>
      </header>

      {/* ANALYTICS CARDS */}
      <div className="admin-grid">
        <div className="card stats-card">
          <h4>Total Submissions</h4>
          <p className="stat-number">{totalSubmissions}</p>
        </div>
        <div className="card stats-card">
          <h4>Approved</h4>
          <p className="stat-number" style={{color: '#28a745'}}>{approvedCount}</p>
        </div>
        <div className="card stats-card">
          <h4>Pending</h4>
          <p className="stat-number" style={{color: '#ff8c00'}}>{pendingCount}</p>
        </div>
        <div className="card stats-card">
          <h4>Avg Rating</h4>
          <p className="stat-number">{avgRating}/5</p>
        </div>
      </div>


    </div>
  );
};

export default InchargeDashboard;
