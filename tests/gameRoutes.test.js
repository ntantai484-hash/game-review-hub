const request = require('supertest');
const app = require('../app');
const Game = require('../models/Game');

describe('GET / (index)', () => {
  beforeEach(async () => {
    await Game.deleteMany({});
    await Game.create({ name: 'RouteGame1' });
  });

  test('returns 200 and contains game name', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/RouteGame1/);
  });
});
