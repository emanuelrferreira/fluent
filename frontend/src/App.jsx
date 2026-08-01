import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
