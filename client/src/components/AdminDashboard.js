import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; 
import { collection, onSnapshot } from 'firebase/firestore';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    // Sync Work Submissions
    const unsubWork = onSnapshot(collection(db, "work_submissions"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(data);
      calculateRankings(data);
    });

    return () => unsubWork();
  }, []);

  const calculateRankings = (allRequests) => {
    const stats = {};
    const approved = allRequests.filter(r => r.status === 'Approved');

    approved.forEach(r => {
      if (!stats[r.processName]) stats[r.processName] = { total: 0, count: 0 };
      stats[r.processName].total += Number(r.rating);
      stats[r.processName].count += 1;
    });

    const calculated = Object.keys(stats).map(name => ({
      name,
      score: (stats[name].total / stats[name].count).toFixed(2),
      count: stats[name].count
    })).sort((a, b) => b.score - a.score);

    setRankings(calculated);
  };



  // Calculate statistics
  const totalSubmissions = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const avgRating = approvedCount > 0 
    ? (requests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + Number(r.rating), 0) / approvedCount).toFixed(2)
    : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>
      
      {/* ANALYTICS CARDS */}
      <div className="admin-grid">
        <div className="card stats-card">
          <h4>Total Submissions</h4>
          <p className="stat-number">{totalSubmissions}</p>
        </div>
        <div className="card stats-card">
          <h4>Pending Reviews</h4>
          <p className="stat-number" style={{color: '#ff8c00'}}>{pendingCount}</p>
        </div>
        <div className="card stats-card">
          <h4>Approved</h4>
          <p className="stat-number" style={{color: '#28a745'}}>{approvedCount}</p>
        </div>
        <div className="card stats-card">
          <h4>Avg Rating</h4>
          <p className="stat-number">{avgRating}/5</p>
        </div>
      </div>

      <div className="admin-grid">
        {/* RANKINGS */}
        <div className="card">
          <h3>Top Performing Processes</h3>
          {rankings.length > 0 ? (
            <table>
              <thead><tr><th>Rank</th><th>Process</th><th>Avg Rating</th><th>Count</th></tr></thead>
              <tbody>
                {rankings.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td>#{i+1}</td>
                    <td>{r.name}</td>
                    <td><strong style={{color: '#3366ff'}}>{r.score}/5.00</strong></td>
                    <td>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No approved submissions yet.</p>}
        </div>

        {/* STATUS BREAKDOWN */}
        <div className="card">
          <h3>Status Breakdown</h3>
          <div style={{padding: '1rem'}}>
            <div style={{marginBottom: '0.8rem'}}>
              <span style={{display: 'inline-block', width: '100px'}}>Pending:</span>
              <span style={{fontWeight: 'bold', color: '#ff8c00'}}>{pendingCount}</span>
            </div>
            <div style={{marginBottom: '0.8rem'}}>
              <span style={{display: 'inline-block', width: '100px'}}>Approved:</span>
              <span style={{fontWeight: 'bold', color: '#28a745'}}>{approvedCount}</span>
            </div>
            <div>
              <span style={{display: 'inline-block', width: '100px'}}>Completion:</span>
              <span style={{fontWeight: 'bold', color: '#3366ff'}}>
                {totalSubmissions > 0 ? ((approvedCount / totalSubmissions) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
