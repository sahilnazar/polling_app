import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreatePoll from './pages/CreatePoll';
import PollList from './pages/PollList';
import PollView from './pages/PollView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/polls" element={<PollList />} />
        <Route path="/polls/:id" element={<PollView />} />
      </Routes>
    </BrowserRouter>
  );
}
