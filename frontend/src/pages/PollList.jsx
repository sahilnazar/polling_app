import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPolls } from '../api';

export default function PollList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPolls()
      .then(setPolls)
      .catch((err) => setError(err.message || 'Failed to load polls'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-zinc-400">Loading polls…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/" className="text-accent hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="text-zinc-400 hover:text-text-primary text-sm mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-accent">Recent polls</h1>
        {polls.length === 0 ? (
          <p className="text-zinc-400">No polls yet. <Link to="/create" className="text-accent hover:underline">Create one</Link>.</p>
        ) : (
          <ul className="space-y-3">
            {polls.map((poll) => (
              <li key={poll.id}>
                <Link
                  to={`/polls/${poll.id}`}
                  className="block px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-800/50 transition"
                >
                  <span className="text-text-primary font-medium">{poll.question}</span>
                  <span className="text-zinc-500 text-sm ml-2">
                    {poll.options?.length ?? 0} options
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
