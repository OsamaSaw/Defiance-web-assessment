const supertest = require('supertest');
const app = require('../app');

// The app runs on the in-memory mock DB and isAuth falls back to the mock
// user (id '1') when no token is sent, so no auth/DB setup is needed here.
const agent = supertest.agent(app);

const validEntry = (overrides = {}) => ({
  type: 'expense',
  amount: 50,
  category: 'Filament',
  date: '2026-06-05',
  note: '10kg box',
  ...overrides
});

// Helper: create an entry and return its body
const createEntry = async (overrides = {}) => {
  const res = await agent.post('/transactions').send(validEntry(overrides)).expect(201);
  return res.body;
};

describe('POST /transactions', () => {
  test('creates an entry and returns it with an id', async () => {
    const res = await agent.post('/transactions').send(validEntry()).expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        userId: '1',
        type: 'expense',
        amount: 50,
        category: 'Filament',
        note: '10kg box',
      })
    );
  });

  test('rejects a non-positive amount', async () => {
    const res = await agent.post('/transactions').send(validEntry({ amount: -5 })).expect(400);
    expect(res.body.message).toMatch(/amount/);
  });

  test('rejects a missing category', async () => {
    const res = await agent.post('/transactions').send(validEntry({ category: '' })).expect(400);
    expect(res.body.message).toMatch(/category/);
  });
});

describe('GET /transactions', () => {
  test('returns the created entry in the list', async () => {
    const created = await createEntry({ category: 'ListTest' });

    const res = await agent.get('/transactions').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(t => t._id === created._id)).toBe(true);
  });
});

describe('GET /transactions/:id', () => {
  test('returns a single entry', async () => {
    const created = await createEntry();

    const res = await agent.get(`/transactions/${created._id}`).expect(200);
    expect(res.body._id).toBe(created._id);
  });

  test('404 for an unknown id', async () => {
    await agent.get('/transactions/does-not-exist').expect(404);
  });
});

describe('PATCH /transactions/:id', () => {
  test('updates an entry', async () => {
    const created = await createEntry({ amount: 50 });

    const res = await agent.patch(`/transactions/${created._id}`).send({ amount: 99.99 }).expect(200);
    expect(res.body.amount).toBe(99.99);
  });

  test('rejects an invalid partial update', async () => {
    const created = await createEntry();

    await agent.patch(`/transactions/${created._id}`).send({ amount: 0 }).expect(400);
  });

  test('404 for an unknown id', async () => {
    await agent.patch('/transactions/does-not-exist').send({ amount: 10 }).expect(404);
  });
});

describe('DELETE /transactions/:id', () => {
  test('deletes an entry', async () => {
    const created = await createEntry();

    await agent.delete(`/transactions/${created._id}`).expect(200);
    await agent.get(`/transactions/${created._id}`).expect(404);
  });

  test('404 for an unknown id', async () => {
    await agent.delete('/transactions/does-not-exist').expect(404);
  });
});
