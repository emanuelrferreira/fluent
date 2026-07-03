import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      setMessage('Account created! Please log in.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', fontFamily: 'Arial' }}>
      <h2>Create your Fluent account</h2>
      <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
      <button onClick={handleSubmit} style={{ padding: '8px 20px', background: '#2E75B6', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Register</button>
      {message && <p>{message}</p>}
    </div>
  );
}
