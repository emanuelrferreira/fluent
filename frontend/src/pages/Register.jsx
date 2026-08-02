import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND = 'https://162-55-210-253.nip.io';

export default function Register() {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setMessage('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await axios.post(`${BACKEND}/api/auth/register`, { name: form.name, email: form.email, firebaseUid: cred.user.uid });
      navigate('/profile');
    } catch (err) { setMessage(err.response?.data?.error || err.message || 'Something went wrong.'); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setMessage('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate('/profile');
    } catch { setMessage('Incorrect email or password.'); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', fontFamily: 'Arial', color: '#fff' }}>
      <h1 style={{ color: '#4A90E2', marginBottom: 4 }}>Fluent</h1>
      <p style={{ color: '#aaa', marginBottom: 24 }}>Language practice with real people</p>
      <div style={{ display: 'flex', marginBottom: 20, gap: 8 }}>
        <button onClick={() => setMode('register')} style={{ flex: 1, padding: 8, background: mode === 'register' ? '#4A90E2' : '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Register</button>
        <button onClick={() => setMode('login')} style={{ flex: 1, padding: 8, background: mode === 'login' ? '#4A90E2' : '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Log in</button>
      </div>
      {mode === 'register' && (
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff', boxSizing: 'border-box' }} />
      )}
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff', boxSizing: 'border-box' }} />
      <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
        onKeyDown={e => e.key === 'Enter' && (mode === 'register' ? handleRegister() : handleLogin())}
        style={{ display: 'block', width: '100%', marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff', boxSizing: 'border-box' }} />
      <button onClick={mode === 'register' ? handleRegister : handleLogin} disabled={loading}
        style={{ width: '100%', padding: 10, background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 15 }}>
        {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Log in'}
      </button>
      {message && <p style={{ color: '#ff6b6b', marginTop: 12 }}>{message}</p>}
    </div>
  );
}
