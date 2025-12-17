import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { fetchMessages } from '../api/chatApi';

// Simple ChatBox component
// Props: projectId (string), me ({ _id, name, token })
const ChatBox = ({ projectId, me }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    // fetch message history
    let mounted = true;
    fetchMessages(projectId).then(res => {
      if (!mounted) return;
      setMessages(res.data || []);
      scrollToBottom();
    }).catch(err => console.error('fetchMessages', err));

    // connect socket
    const token = me?.token || localStorage.getItem('token');
    const socket = io('/', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { projectId });
    });

    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect error', err.message);
    });

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.emit('leave', { projectId });
        socketRef.current.disconnect();
      }
    };
  }, [projectId]);

  const scrollToBottom = () => {
    try { listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch (e) {}
  };

  const handleSend = (e) => {
    e.preventDefault();
    const s = socketRef.current;
    if (!s || !text.trim()) return;
    const payload = { projectId, text: text.trim() };
    s.emit('chat:message', payload);
    setText('');
  };

  return (
    <div className="chat-box" style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, padding: 12, maxWidth: 600 }}>
      <div className="chat-messages" style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((m) => (
          <div key={m._id || `${m.sender?._id}-${m.createdAt}`} style={{ padding: '6px 8px', marginBottom: 6, background: m.sender?._id === me?._id ? 'linear-gradient(90deg,#a8edea,#fed6e3)' : '#000000ff', borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>{m.sender?.name || m.sender?.email || 'User'}</div>
            <div style={{ fontSize: 14 }}>{m.text}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <div ref={listRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input aria-label="Message" value={text} onChange={e => setText(e.target.value)} placeholder="Write a message..." style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ffffffff' }} />
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, background: '#2d9cdb', color: '#fff', border: 'none' }}>Send</button>
      </form>
    </div>
  );
};

export default ChatBox;
