import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-accent">Polling App</h1>
        <p className="text-zinc-400">Create polls and see live results.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/create"
            className="px-6 py-3 rounded-xl bg-accent text-white font-medium hover:opacity-90 transition"
          >
            Create a poll
          </Link>
          <Link
            to="/polls"
            className="px-6 py-3 rounded-xl border border-zinc-700 text-text-primary font-medium hover:bg-zinc-800/50 transition"
          >
            Browse polls
          </Link>
        </div>
      </div>
    </div>
  );
}
