import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND = 'http://162.55.210.253:5000';
const LANGUAGES = ['English', 'Portuguese', 'Spanish', 'French', 'German', 'Italian', 'Mandarin', 'Japanese', 'Korean', 'Arabic'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ nativeLanguage: '', targetLanguage: '', proficiencyLevel: 'beginner' });
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (!u) navigate('/'); else setUser(u); });
    return unsub;
  }, []);

  const handleSave = async () => {
    if (!form.nativeLanguage || !form.targetLanguage) { setMessage('Please select both languages.'); return; }
    if (form.nativeLanguage === form.targetLanguage) { setMessage('Native and target language cannot be the same.'); return; }
    try {
      await axios.put(`${BACKEND}/api/auth/profile/${user.uid}`, form);
      setSaved(true);
      setTimeout(() => navigate('/chat'), 800);
    } catch { setMessage('Could not save profile. Please try again.'); }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', fontFamily: 'Arial', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#4A90E2', margin: 0 }}>Your profile</h2>
        <button onClick={() => { signOut(auth); navigate('/'); }} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>Log out</button>
      </div>
      <p style={{ color: '#aaa', marginBottom: 20 }}>Set your languages to find a match.</p>
      <label style={{ display: 'block', marginBottom: 6, color: '#ccc' }}>I speak (native language)</label>
      <select value={form.nativeLanguage} onChange={e => setForm({ ...form, nativeLanguage: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff', boxSizing: 'border-box' }}>
        <option value="">Select language</option>
        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <label style={{ display: 'block', marginBottom: 6, color: '#ccc' }}>I want to practise</label>
      <select value={form.targetLanguage} onChange={e => setForm({ ...form, targetLanguage: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff', boxSizing: 'border-box' }}>
        <option value="">Select language</option>
        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
      </select>
      <label style={{ display: 'block', marginBottom: 6, color: '#ccc' }}>My level in {form.targetLanguage || 'target language'}</label>
      <select value={form.proficiencyLevel} onChange={e => setForm({ ...form, proficiencyLevel: e.target.value })}
        style={{ display: 'block', width: '100%', marginBottom: 20, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff', boxSizing: 'border-box' }}>
        {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
      </select>
      <button onClick={handleSave}
        style={{ width: '100%', padding: 10, background: saved ? '#27ae60' : '#4A90E2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 15 }}>
        {saved ? 'Saved! Finding a match...' : 'Save and find a match'}
      </button>
      {message && <p style={{ color: '#ff6b6b', marginTop: 12 }}>{message}</p>}
    </div>
  );
}
