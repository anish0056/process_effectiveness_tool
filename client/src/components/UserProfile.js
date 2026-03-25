import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const UserProfile = ({ user, onClose }) => {
  const [userStats, setUserStats] = useState({
    totalSubmissions: 0,
    approvedCount: 0,
    pendingCount: 0,
    avgRating: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'incharge') return;

    const q = query(collection(db, "work_submissions"), where("inchargeId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const submissions = snap.docs.map(d => d.data());
      const approved = submissions.filter(s => s.status === 'Approved');
      const pending = submissions.filter(s => s.status === 'Pending');
      
      const avgRating = approved.length > 0 
        ? (approved.reduce((sum, s) => sum + Number(s.rating), 0) / approved.length).toFixed(2)
        : 0;

      setUserStats({
        totalSubmissions: submissions.length,
        approvedCount: approved.length,
        pendingCount: pending.length,
        avgRating
      });
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="profile-content">
          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="profile-row">
              <span className="profile-label">Email:</span>
              <span className="profile-value">{user.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Role:</span>
              <span className="profile-badge">{user.role === 'admin' ? 'Administrator' : 'Incharge'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Joined:</span>
              <span className="profile-value">{user.createdAt || 'N/A'}</span>
            </div>
          </div>

          {user.role === 'incharge' && (
            <div className="profile-section">
              <h3>Performance Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Submissions</div>
                  <div className="stat-value">{userStats.totalSubmissions}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Approved</div>
                  <div className="stat-value" style={{color: '#28a745'}}>{userStats.approvedCount}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Pending</div>
                  <div className="stat-value" style={{color: '#ff8c00'}}>{userStats.pendingCount}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg Rating</div>
                  <div className="stat-value" style={{color: '#3366ff'}}>{userStats.avgRating}/5</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
