import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPoll, vote as submitVote } from '../api';

export default function PollView() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getPoll(id)
      .then((data) => {
        if (!cancelled) setPoll(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load poll');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleVote = async () => {
    if (!selectedOptionId || hasVoted) return;
    setVoting(true);
    setError('');
    try {
      const updated = await submitVote(id, selectedOptionId);
      setPoll(updated);
      setHasVoted(true);
    } catch (err) {
      setError(err.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading poll…</p>
      </div>
    );
  }
  if (error && !poll) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/" className="text-violet-500 hover:underline">Back to home</Link>
      </div>
    );
  }
  if (!poll) return null;

  const totalVotes = poll.options.reduce((sum, o) => sum + (o.voteCount || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="text-zinc-400 hover:text-zinc-100 text-sm mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-zinc-100">{poll.question}</h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2">
            {error}
          </p>
        )}

        {!hasVoted ? (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">Select one option and vote:</p>
            {poll.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                  selectedOptionId === opt.id
                    ? 'border-violet-500 bg-violet-500/20 text-zinc-100'
                    : 'border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {opt.text}
              </button>
            ))}
            <button
              onClick={handleVote}
              disabled={!selectedOptionId || voting}
              className="w-full py-3 rounded-xl bg-violet-500 text-white font-medium hover:opacity-90 disabled:opacity-50 transition mt-4"
            >
              {voting ? 'Submitting…' : 'Vote'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">Results (total votes: {totalVotes})</p>
            <div className="space-y-3">
              {poll.options.map((opt) => {
                const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                return (
                  <div key={opt.id} className="rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="flex justify-between px-4 py-2 text-sm">
                      <span className="text-zinc-100">{opt.text}</span>
                      <span className="text-zinc-400">{opt.voteCount} votes ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-zinc-800">
                      <div
                        className="h-full bg-violet-500 rounded-r transition-all duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
