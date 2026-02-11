const API_BASE = import.meta.env.VITE_API_URL || '';

export async function getPolls() {
  const res = await fetch(`${API_BASE}/api/polls`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPoll(id) {
  const res = await fetch(`${API_BASE}/api/polls/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Poll not found');
    throw new Error(await res.text());
  }
  return res.json();
}

export async function createPoll(question, options) {
  const res = await fetch(`${API_BASE}/api/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: question.trim(), options }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText);
  }
  return res.json();
}

export async function vote(pollId, optionId) {
  const res = await fetch(`${API_BASE}/api/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText);
  }
  return res.json();
}
