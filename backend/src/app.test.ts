import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

const mockPoll = {
  id: 'poll-1',
  question: 'Test question?',
  createdAt: new Date('2026-01-01'),
  options: [
    { id: 'opt-1', pollId: 'poll-1', text: 'A', voteCount: 0 },
    { id: 'opt-2', pollId: 'poll-1', text: 'B', voteCount: 0 },
  ],
};

const mockPrisma = {
  poll: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  option: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

describe('API', () => {
  const app = createApp(mockPrisma as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/polls', () => {
    it('returns 200 and list of polls', async () => {
      mockPrisma.poll.findMany.mockResolvedValue([mockPoll]);
      const res = await request(app).get('/api/polls');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].question).toBe('Test question?');
      expect(res.body[0].options).toHaveLength(2);
    });

    it('returns 500 on db error', async () => {
      mockPrisma.poll.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/polls');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch polls');
    });
  });

  describe('GET /api/polls/:id', () => {
    it('returns 200 and poll when found', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue(mockPoll);
      const res = await request(app).get('/api/polls/poll-1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('poll-1');
      expect(res.body.question).toBe('Test question?');
    });

    it('returns 404 when poll not found', async () => {
      mockPrisma.poll.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/api/polls/not-found');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Poll not found');
    });
  });

  describe('POST /api/polls', () => {
    it('returns 400 when question is missing', async () => {
      const res = await request(app)
        .post('/api/polls')
        .send({ options: ['A', 'B'] });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Question is required');
    });

    it('returns 400 when options is not an array', async () => {
      const res = await request(app)
        .post('/api/polls')
        .send({ question: 'Q?', options: 'not-array' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Options must be an array');
    });

    it('returns 400 when fewer than 2 options', async () => {
      const res = await request(app)
        .post('/api/polls')
        .send({ question: 'Q?', options: ['Only one'] });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'At least 2 options are required');
    });

    it('returns 201 and created poll with 2 options', async () => {
      const created = { ...mockPoll, question: 'Test?' };
      mockPrisma.poll.create.mockResolvedValue(created);
      const res = await request(app)
        .post('/api/polls')
        .send({ question: 'Test?', options: ['A', 'B'] });
      expect(res.status).toBe(201);
      expect(res.body.question).toBe('Test?');
      expect(res.body.options).toHaveLength(2);
      expect(mockPrisma.poll.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            question: 'Test?',
            options: { create: [{ text: 'A' }, { text: 'B' }] },
          },
          include: { options: true },
        })
      );
    });
  });

  describe('POST /api/polls/:id/vote', () => {
    it('returns 400 when optionId is missing', async () => {
      const res = await request(app).post('/api/polls/poll-1/vote').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'optionId is required');
    });

    it('returns 400 when option does not belong to poll', async () => {
      mockPrisma.option.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/polls/poll-1/vote')
        .send({ optionId: 'wrong-opt' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid option for this poll');
    });

    it('returns 200 and updated poll after vote', async () => {
      mockPrisma.option.findFirst.mockResolvedValue({
        id: 'opt-1',
        pollId: 'poll-1',
        text: 'A',
        voteCount: 0,
      });
      const updatedPoll = {
        ...mockPoll,
        options: [
          { id: 'opt-1', pollId: 'poll-1', text: 'A', voteCount: 1 },
          { id: 'opt-2', pollId: 'poll-1', text: 'B', voteCount: 0 },
        ],
      };
      mockPrisma.option.update.mockResolvedValue(updatedPoll.options[0]);
      mockPrisma.poll.findUnique.mockResolvedValue(updatedPoll);
      const res = await request(app)
        .post('/api/polls/poll-1/vote')
        .send({ optionId: 'opt-1' });
      expect(res.status).toBe(200);
      expect(res.body.options[0].voteCount).toBe(1);
    });
  });
});
