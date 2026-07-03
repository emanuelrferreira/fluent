import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
const TOTAL_SECS = 15 * 60;

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECS);
  const [switchNotice, setSwitchNotice] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    socket.on('matched', ({ room }) => setRoom(room));
    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    return () => { socket.off('matched'); socket.off('receive_message'); };
  }, []);

  useEffect(() => {
    if (!room) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === TOTAL_SECS / 2) setSwitchNotice(true);
        return prev <= 0 ? 0 : prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [room]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !room) return;
    socket.emit('send_message', { room, message: input, sender: 'You' });
    setMessages(prev => [...prev, { message: input, sender: 'You' }]);
    setInput('');
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Fluent Session</h2>
      <div style={{ background: switchNotice ? '#fff2cc' : '#e2efda', padding: '8px 16px', borderRadius: 6, marginBottom: 12, fontWeight: 'bold' }}>
        {mins}:{secs} remaining {switchNotice && '— Switch languages now!'}
      </div>
      {!room && <p style={{ color: '#999' }}>Looking for a match...</p>}
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'auto', padding: 12, borderRadius: 6 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: m.sender === 'You' ? 'right' : 'left' }}>
            <span style={{ background: m.sender === 'You' ? '#2E75B6' : '#eee', color: m.sender === 'You' ? '#fff' : '#000', padding: '6px 12px', borderRadius: 16, display: 'inline-block' }}>
              {m.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: 'flex', marginTop: 10, gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
        <button onClick={sendMessage} style={{ padding: '8px 16px', background: '#2E75B6', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Send</button>
      </div>
    </div>
  );
}
