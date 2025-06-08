const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Expense = require('../src/models/expense.model');
const axios = require('axios');
jest.mock('axios');
jest.mock('jsonwebtoken');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/expense', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).post('/api/expense').send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nie przechodzą walidacji', async () => {
    axios.get.mockResolvedValue({ data: null }); // spowoduje błąd walidacji categoryId

    const res = await request(app)
      .post('/api/expense')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        amount: 0, // nie przechodzi .custom
        categoryId: 'invalid-cat',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    axios.get.mockResolvedValue({ data: {} }); // kategoria istnieje

    Expense.prototype.save = jest.fn(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .post('/api/expense')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        amount: 100,
        categoryId: 'cat123',
        budgetId: 'bud123',
        accountId: 'acc123',
        date: '2025-06-06',
        note: 'Lunch',
        tags: ['jedzenie'],
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd tworzenia wydatku');
  });

  it('zwraca 201 jeśli wydatek został utworzony', async () => {
    axios.get.mockResolvedValue({ data: {} }); // walidacja przechodzi

    Expense.prototype.save = jest.fn().mockResolvedValue({
      _id: 'some-id',
      userId,
      amount: 100,
      categoryId: 'cat123',
      budgetId: 'bud123',
      accountId: 'acc123',
      date: new Date('2025-06-06'),
      note: 'Lunch',
      tags: ['jedzenie'],
    });

    const res = await request(app)
      .post('/api/expense')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        amount: 100,
        categoryId: 'cat123',
        budgetId: 'bud123',
        accountId: 'acc123',
        date: '2025-06-06',
        note: 'Lunch',
        tags: ['jedzenie'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono wydatek.');
    expect(res.body.expense).toMatchObject({
      userId,
      amount: 100,
      categoryId: 'cat123',
      budgetId: 'bud123',
      accountId: 'acc123',
      date: '2025-06-06T00:00:00.000Z',
      note: 'Lunch',
      tags: ['jedzenie'],
    });
  });
});

describe('GET /api/expense', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/expense');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Expense, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/expense').set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania wydatków');
  });

  it('zwraca 200 i listę wydatków', async () => {
    const mockExpenses = [
      {
        _id: '665f00000000000000000001',
        userId,
        amount: 100,
        categoryId: 'cat123',
        budgetId: 'bud123',
        accountId: 'acc123',
        date: '2025-06-06T00:00:00.000Z',
        note: 'Lunch',
        tags: ['jedzenie'],
      },
    ];

    jest.spyOn(Expense, 'find').mockReturnValueOnce({
      sort: jest.fn().mockResolvedValue(mockExpenses),
    });

    const res = await request(app).get('/api/expense').set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono wydatki');
    expect(res.body.expenses).toEqual(expect.arrayContaining(mockExpenses));
  });

  it('filtruje po budgetId i zakresie dat', async () => {
    const mockExpenses = [];

    const mockFind = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockExpenses),
    });

    jest.spyOn(Expense, 'find').mockImplementation(mockFind);

    const res = await request(app)
      .get('/api/expense')
      .query({ budgetId: 'bud123', from: '2025-01-01', to: '2025-12-31' })
      .set('Authorization', `Bearer ${validToken}`);

    expect(mockFind).toHaveBeenCalledWith({
      userId,
      budgetId: 'bud123',
      date: { $gte: new Date('2025-01-01'), $lte: new Date('2025-12-31') },
    });
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /api/expense/all/expenses', () => {
  const validToken = 'mocked-token';
  const adminId = 'admin-123456';
  const userToken = 'user-token';

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/expense/all/expenses');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 403 jeśli użytkownik nie ma roli admin', async () => {
    jwt.verify.mockReturnValue({ id: adminId, role: 'user' });

    const res = await request(app)
      .get('/api/expense/all/expenses')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Brak uprawnień do tego zasobu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jwt.verify.mockReturnValue({ id: adminId, role: 'admin' });

    jest.spyOn(Expense, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/expense/all/expenses')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania wydatku');
  });

  it('zwraca 200 i listę wszystkich wydatków jako admin', async () => {
    jwt.verify.mockReturnValue({ id: adminId, role: 'admin' });

    const mockExpenses = [
      {
        _id: '665f00000000000000000001',
        userId: 'user1',
        amount: 150,
        categoryId: 'cat1',
        budgetId: 'bud1',
        accountId: 'acc1',
        date: '2025-06-06T00:00:00.000Z',
        note: 'Obiad',
        tags: ['jedzenie'],
      },
    ];

    jest.spyOn(Expense, 'find').mockResolvedValue(mockExpenses);

    const res = await request(app)
      .get('/api/expense/all/expenses')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono wydatki');
    expect(res.body.expenses).toEqual(expect.arrayContaining(mockExpenses));
  });
});

describe('GET /api/expense/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'user-123456';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/expense/665f00000000000000000001');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli wydatek nie istnieje', async () => {
    jest.spyOn(Expense, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get('/api/expense/665f00000000000000000001')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Wydatek nie znaleziony');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Expense, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/expense/665f00000000000000000001')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania wydatku');
  });

  it('zwraca 200 i dane wydatku jeśli istnieje i należy do użytkownika', async () => {
    const mockExpense = {
      _id: '665f00000000000000000001',
      userId,
      amount: 200,
      categoryId: 'cat1',
      budgetId: 'bud1',
      accountId: 'acc1',
      date: '2025-06-06T00:00:00.000Z',
      note: 'Zakupy',
      tags: ['spożywcze'],
    };

    jest.spyOn(Expense, 'findOne').mockResolvedValue(mockExpense);

    const res = await request(app)
      .get('/api/expense/665f00000000000000000001')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono wydatek');
    expect(res.body.expense).toEqual(mockExpense);
  });
});

describe('GET /api/expense/get/summary', () => {
  const validToken = 'mocked-token';
  const userId = 'user-123456';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/expense/get/summary');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Expense, 'aggregate').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/expense/get/summary')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd agregacji wydatków');
  });

  it('zwraca 200 i podsumowanie wydatków bez budgetId', async () => {
    const mockResult = [
      {
        totalSpent: 300,
        byCategory: [
          { category: 'food', total: 200 },
          { category: 'transport', total: 100 },
        ],
      },
    ];

    jest.spyOn(Expense, 'aggregate').mockResolvedValue(mockResult);

    const res = await request(app)
      .get('/api/expense/get/summary')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toEqual(mockResult[0]);
  });

  it('zwraca 200 i podsumowanie wydatków z budgetId', async () => {
    const mockResult = [
      {
        totalSpent: 150,
        byCategory: [{ category: 'entertainment', total: 150 }],
      },
    ];

    jest.spyOn(Expense, 'aggregate').mockResolvedValue(mockResult);

    const res = await request(app)
      .get('/api/expense/get/summary?budgetId=bud123')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toEqual(mockResult[0]);
  });
});

describe('GET /api/expense/unusual/check', () => {
  const validToken = 'mocked-token';
  const adminId = 'admin-123';
  const mockNotify = jest.fn();

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: adminId, role: 'admin' });
    jest.clearAllMocks();
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/expense/unusual/check');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Expense, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/expense/unusual/check')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd sprawdzania wydatków');
  });

  it('zwraca 200 i wykrywa nietypowy wydatek', async () => {
    const recentExpenses = [
      {
        _id: '1',
        userId: 'user1',
        amount: 120,
        categoryId: 'food',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ];

    const previousExpenses = [
      {
        amount: 40,
        categoryId: 'food',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
    ];

    jest
      .spyOn(Expense, 'find')
      .mockResolvedValueOnce(recentExpenses)
      .mockResolvedValueOnce(previousExpenses);

    jest.mock('../src/utils/notifyUser', () => ({
      notifyUser: mockNotify,
    }));

    const res = await request(app)
      .get('/api/expense/unusual/check')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Sprawdzono nietypowe wydatki.');
  });
});

describe('PUT /api/expense/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'user-123456';
  const expenseId = '665f00000000000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.verify = jest.fn(() => ({ id: userId, role: 'user' }));
  });

  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).put(`/api/expense/${expenseId}`).send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli walidacja nie przejdzie (kwota < 0.01)', async () => {
    const res = await request(app)
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ amount: -10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli kategoria nie istnieje', async () => {
    axios.get.mockRejectedValueOnce(new Error('404'));

    const res = await request(app)
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ categoryId: 'nonexistent' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 404 jeśli wydatek nie istnieje', async () => {
    axios.get.mockResolvedValueOnce({ data: { name: 'Jedzenie' } }); // kategoria OK

    jest.spyOn(Expense, 'findOneAndUpdate').mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ categoryId: '123' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    axios.get.mockResolvedValueOnce({ data: { name: 'Transport' } });

    jest.spyOn(Expense, 'findOneAndUpdate').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ categoryId: '123' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd aktualizacji wydatku');
  });

  it('zwraca 200 i zaktualizowany wydatek', async () => {
    const mockExpense = {
      _id: expenseId,
      userId,
      amount: 100,
      categoryId: '123',
      note: 'Zaktualizowane',
    };

    axios.get.mockResolvedValueOnce({ data: { name: 'Transport' } });

    jest.spyOn(Expense, 'findOneAndUpdate').mockResolvedValue(mockExpense);

    const res = await request(app)
      .put(`/api/expense/${expenseId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ categoryId: '123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zaktualizowano pomyślnie.');
    expect(res.body.expense).toMatchObject(mockExpense);
  });
});
