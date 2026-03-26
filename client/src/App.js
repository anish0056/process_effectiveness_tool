import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AdminDashboard from './components/AdminDashboard';
import InchargeDashboard from './components/InchargeDashboard';
import SubmitWork from './components/SubmitWork';
import Submissions from './components/Submissions';
import History from './components/History';
import UserProfile from './components/UserProfile';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log('Auth state changed:', authUser?.email);
      if (authUser) {
        const docRef = doc(db, "users", authUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log('Found user document:', docSnap.data());
            setUser({ uid: authUser.uid, ...docSnap.data() });
            setRole(docSnap.data().role);
          } else {
            // Determine role based on email for new users without Firestore record
            const isAdmin = authUser.email === 'anish.ag23@bitsathy.ac.in';
            const userRole = isAdmin ? 'admin' : 'incharge';
            console.log('User not in Firestore, setting role:', userRole);
            // Save the user document with role
            await setDoc(docRef, {
              email: authUser.email,
              role: userRole
            });
            setUser({ uid: authUser.uid, email: authUser.email, role: userRole });
            setRole(userRole);
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUser({ uid: authUser.uid, email: authUser.email });
          setRole('incharge');
        }
      } else {
        console.log('User logged out');
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      
      // Determine role based on email domain
      const isAdmin = result.user.email === 'anish.ag23@bitsathy.ac.in';
      const userRole = isAdmin ? 'admin' : 'incharge';
      
      // Create user document in Firestore if it doesn't exist
      const docRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('Creating new user document with role:', userRole);
        await setDoc(docRef, {
          email: result.user.email,
          role: userRole,
          createdAt: new Date().toLocaleString()
        });
        console.log('User document created successfully');
      } else {
        console.log('User document already exists');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      const friendlyMessage = error.code === 'auth/unauthorized-domain'
        ? 'Unauthorized domain: add https://processeffectivenesstool.netlify.app to Firebase Auth > Sign-in method > Authorized domains.'
        : error.message;
      alert('Google sign-in failed: ' + friendlyMessage);
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="App">
      {user ? (
        <div className="app-container">
          <Sidebar 
            role={role} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            user={user}
            onLogout={() => signOut(auth)}
            onProfileClick={() => setShowProfile(true)}
          />
          <main className="main-content">
            {role === 'admin' ? (
              currentPage === 'submissions' ? <Submissions /> : <AdminDashboard />
            ) : (
              currentPage === 'submit' ? (
                <SubmitWork user={user} />
              ) : currentPage === 'history' ? (
                <History user={user} />
              ) : (
                <InchargeDashboard user={user} />
              )
            )}
          </main>
          {showProfile && <UserProfile user={user} onClose={() => setShowProfile(false)} />}
        </div>
      ) : (
        <div className="login-page">
          <div className="login-box">
            <div className="login-brand">
              <div className="login-brand-icon" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="48" height="48" rx="12" fill="#0ea5e9" />
                  <path d="M26 38L30 30L34 34L38 26" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M24 44H40" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="brand-title">Web Based Process Effectiveness Tool</h1>
            </div>
            <p className="brand-subtitle">Industrial Portal Access</p>
            <button className="google-btn" onClick={handleGoogleSignIn}>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{marginRight: '8px'}}>
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.2 8.9 3.5l6.6-6.6C35.5 2.9 29.2 0 24 0 14.6 0 6.5 5.8 2.5 14.1l7.7 6c1.9-5.5 7.1-9.6 13.8-9.6z"/>
                <path fill="#34A853" d="M46.5 24c0-1.6-0.1-3.1-0.4-4.6H24v8.7h12.7c-0.5 2.7-2 5-4.3 6.5l6.8 5.3c4-3.7 6.3-9.2 6.3-15.9z"/>
                <path fill="#4A90E2" d="M10.2 28.6c-0.5-1.4-0.8-2.9-0.8-4.6s0.3-3.2 0.8-4.6L2.5 13.5C0.9 16.6 0 20.2 0 24s0.9 7.4 2.5 10.5l7.7-6.9z"/>
                <path fill="#FBBC05" d="M24 48c6.5 0 12-2.1 16-5.7l-7.7-6c-2.3 1.6-5.2 2.5-8.3 2.5-6.7 0-12.1-4.1-13.8-9.6l-7.7 6c4 8.3 12.1 14.1 21.5 14.1z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;