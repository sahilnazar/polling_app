import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoll } from '../api';

const MIN_OPTIONS = 2;

export default function CreatePoll() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addOption = () => setOptions((o) => [...o, '']);
  const removeOption = (i) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((o) => o.filter((_, idx) => idx !== i));
  };
  const setOption = (i, value) => {
    setOptions((o) => o.map((v, idx) => (idx === i ? value : v)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }
    if (trimmed.length < MIN_OPTIONS) {
      setError(`Please add at least ${MIN_OPTIONS} options.`);
      return;
    }
    setLoading(true);
    try {
      const poll = await createPoll(question.trim(), trimmed);
      navigate(`/polls/${poll.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create poll.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-violet-500">Create a poll</h1>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-zinc-800 p-6 bg-zinc-900/30">
          {error && (
            <p className="text-red-400 text-sm rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-zinc-300">Options (min {MIN_OPTIONS})</label>
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-violet-500 hover:underline"
              >
                + Add option
              </button>
            </div>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    disabled={options.length <= MIN_OPTIONS}
                    className="px-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-violet-500 text-white font-medium hover:opacity-90 disabled:opacity-60 transition"
          >
            {loading ? 'Creating…' : 'Create poll'}
          </button>
        </form>
      </div>
    </div>
  );
}
