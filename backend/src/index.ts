import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/polls — list recent polls
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { options: true },
    });
    res.json(polls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// GET /api/polls/:id — fetch poll by id
app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: req.params.id },
      include: { options: true },
    });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch poll' });
  }
});

// POST /api/polls — create poll (min 2 options)
app.post('/api/polls', async (req, res) => {
  try {
    const { question, options: optionTexts } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (!Array.isArray(optionTexts)) {
      return res.status(400).json({ error: 'Options must be an array' });
    }
    const trimmed = optionTexts.map((o: unknown) => (typeof o === 'string' ? o.trim() : '')).filter(Boolean);
    if (trimmed.length < 2) {
      return res.status(400).json({ error: 'At least 2 options are required' });
    }
    const poll = await prisma.poll.create({
      data: {
        question: question.trim(),
        options: {
          create: trimmed.map((text: string) => ({ text })),
        },
      },
      include: { options: true },
    });
    res.status(201).json(poll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// POST /api/polls/:id/vote — vote for an option
app.post('/api/polls/:id/vote', async (req, res) => {
  try {
    const pollId = req.params.id;
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: 'optionId is required' });

    const option = await prisma.option.findFirst({
      where: { id: optionId, pollId },
    });
    if (!option) return res.status(400).json({ error: 'Invalid option for this poll' });

    await prisma.option.update({
      where: { id: optionId },
      data: { voteCount: { increment: 1 } },
    });

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    res.json(poll!);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
