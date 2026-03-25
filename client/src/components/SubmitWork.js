import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

function SubmitWork({ user }) {
  const [formData, setFormData] = useState({ title: '', description: '', processName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.processName.trim()) {
      alert('Please fill all fields');
      return;
    }
    await addDoc(collection(db, 'work_submissions'), {
      ...formData,
      inchargeId: user.uid,
      inchargeEmail: user.email,
      status: 'Pending',
      rating: 0,
      submittedAt: new Date().toLocaleString()
    });
    setFormData({ title: '', description: '', processName: '' });
    alert('Process detail submitted to Admin!');
  };

  return (
    <div className="dashboard">
      <section className="card">
        <h3>Submit New Process Update</h3>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Process Name"
            value={formData.processName}
            onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
            required
          />
          <input
            placeholder="Work Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Describe what was done in this process..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <button type="submit" className="btn">Submit for Rating</button>
        </form>
      </section>
    </div>
  );
}

export default SubmitWork;
