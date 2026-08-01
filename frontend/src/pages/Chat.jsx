import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5000');
const TOTAL_SECS = 15 * 60;

export default function Chat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECS);
  const [switched, setSwitched] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [searching, setSearching] = useState(false);
  const endRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (!u) navigate('/'); else setUser(u); });
    return unsub;
  }, []);

  useEffect(() => {
    socket.on('matched', ({ room }) => { setRoom(room); setSearching(false); });
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('session_prompt', ({ prompt }) => setPrompt(prompt));
    return () => { socket.off('matched'); socket.off('receive_message'); socket.off('session_prompt'); };
  }, []);

  useEffect(() => {
    if (!room) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev === TOTAL_SECS / 2) setSwitched(true); return prev <= 0 ? 0 : prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [room]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const findMatch = async () => {
    if (!user) return;
    setSearching(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/auth/profile/${user.uid}`);
      socket.emit('find_match', { userId: user.uid, nativeLanguage: data.nativeLanguage, targetLanguage: data.targetLanguage, proficiencyLevel: data.proficiencyLevel });
    } catch { setSearching(false); alert('Could not load your profile. Please go back and save your language settings.'); }
  };

  const sendMessage = () => {
    if (!input.trim() || !room) return;
    socket.emit('send_message', { room, message: input, sender: 'You' });
    setMessages(prev => [...prev, { message: input, sender: 'You' }]);
    setInput('');
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'Arial', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#4A90E2', margin: 0 }}>Fluent Session</h2>
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>Back</button>
      </div>

      {!room && !searching && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#aaa', marginBottom: 20 }}>Ready to practise? We will find you a partner now.</p>
          <button onClick={findMatch} style={{ padding: '12px 32px', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}>Find a match</button>
        </div>
      )}

      {searching && <div style={{ textAlign: 'center', padding: 40 }}><p style={{ color: '#aaa' }}>Looking for a partner...</p></div>}

      {room && (
        <>
          <div style={{ background: switched ? '#2c2000' : '#002c1a', border: `1px solid ${switched ? '#7F6000' : '#375623'}`, padding: '10px 16px', borderRadius: 6, marginBottom: 12 }}>
            <span style={{ fontWeight: 'bold', color: switched ? '#FFD700' : '#27ae60' }}>
              {mins}:{secs} {switched ? '— Switch languages now!' : '— First language half'}
            </span>
          </div>
          {prompt && (
            <div style={{ background: '#1a1a2e', border: '1px solid #4A90E2', padding: '10px 16px', borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
              <span style={{ color: '#4A90E2', fontWeight: 'bold' }}>Topic suggestion: </span><span style={{ color: '#aaa' }}>{prompt}</span>
            </div>
          )}
          <div style={{ border: '1px solid #333', height: 320, overflowY: 'auto', padding: 12, borderRadius: 6, background: '#111' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, textAlign: m.sender === 'You' ? 'right' : 'left' }}>
                <span style={{ background: m.sender === 'You' ? '#4A90E2' : '#2a2a2a', color: '#fff', padding: '8px 14px', borderRadius: 16, display: 'inline-block', maxWidth: '75%' }}>
                  {m.message}
                </span>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div style={{ display: 'flex', marginTop: 10, gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#222', color: '#fff' }} />
            <button onClick={sendMessage} style={{ padding: '10px 18px', background: '#4A90E2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}
