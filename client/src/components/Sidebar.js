import React from 'react';

function Sidebar({ role, currentPage, setCurrentPage, user, onLogout, onProfileClick }) {
  const menuItems = role === 'admin' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'submissions', label: 'Submissions', icon: '📋' },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'submit', label: 'Submit Work', icon: '➕' },
        { id: 'history', label: 'My Submission', icon: '📝' },
      ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo" aria-label="WPET logo">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="48" height="48" rx="12" fill="#0ea5e9" />
            <path d="M26 38L30 30L34 34L38 26" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 44H40" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="sidebar-title">WPET</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="user-btn" onClick={onProfileClick}>
          <span className="user-icon">👤</span>
          <div className="user-details">
            <div className="user-email">{user?.email?.split('@')[0]}</div>
            <div className="user-role">{role}</div>
          </div>
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
