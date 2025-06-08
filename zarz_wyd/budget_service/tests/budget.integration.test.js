const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Budget = require('../src/models/budget.model');
const axios = require('axios');
const { notifyUser } = require('../src/utils/notifyUser');

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('../src/utils/notifyUser', () => ({
  notifyUser: jest.fn(),
}));

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/budget', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).post('/api/budget').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nieprzechodzą walidacji', async () => {
    const res = await request(app)
      .post('/api/budget')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 201 jeśli budżet został utworzony', async () => {
    const category = {
      id: '1',
      name: 'jedzenie',
    };

    const budget = {
      limits: [{ category: '1', amount: 300 }],
      period: 'monthly',
      startDate: '2025-07-01',
      endDate: '2025-08-01',
    };

    axios.get.mockResolvedValue({ data: { category } });

    const res = await request(app)
      .post('/api/budget')
      .set('Authorization', `Bearer ${validToken}`)
      .send(budget);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono budżet');
    expect(res.body.budget).toBeDefined();
  });
});

describe('GET /api/budget', () => {
  const validToken = 'mocked-token';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/budget');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i listę budżetów', async () => {
    const res = await request(app).get('/api/budget').set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono budżety');
    expect(Array.isArray(res.body.budgets)).toBe(true);
  });

  it('zwraca 500 jeśli zapytanie do bazy rzuci wyjątek', async () => {
    jest.spyOn(Budget, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/budget').set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania budżetów');
  });
});

describe('GET /api/budget/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'test-user-id';
  const budgetId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get(`/api/budget/${budgetId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli budget nie istnieje', async () => {
    jest.spyOn(Budget, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Brak budżetu');
  });

  it('zwraca 200 i budżet, jeśli istnieje', async () => {
    const mockBudget = {
      _id: budgetId,
      userId,
      limits: [{ category: '1', amount: 300 }],
      period: 'monthly',
      startDate: '2025-07-01',
      endDate: '2025-08-01',
      isActive: false,
    };

    jest.spyOn(Budget, 'findOne').mockResolvedValue(mockBudget);

    axios.get.mockResolvedValue({ data: null });

    const res = await request(app)
      .get(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono budżet');
    expect(res.body.budget).toMatchObject(mockBudget);
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Budget, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania budżetu');
  });
});

describe('GET /api/budget/all/budgets', () => {
  const validToken = 'mocked-token';

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/budget/all/budgets');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 403 jeśli użytkownik nie jest adminem', async () => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });

    const res = await request(app)
      .get('/api/budget/all/budgets')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Brak uprawnień do tego zasobu');
  });

  it('zwraca 500 jeśli zapytanie do bazy rzuci wyjątek', async () => {
    jwt.verify.mockReturnValue({ id: 'admin-id', role: 'admin' });

    jest.spyOn(Budget, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/budget/all/budgets')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania budżetów');
  });

  it('zwraca 200 i wszystkie budgety, jeśli admin', async () => {
    jwt.verify.mockReturnValue({ id: 'admin-id', role: 'admin' });

    const mockBudgets = [
      {
        _id: '1',
        userId: '1',
        limits: [{ category: '1', amount: 300 }],
        period: 'monthly',
        startDate: '2025-07-01',
        endDate: '2025-08-01',
        isActive: false,
      },
      {
        _id: '2',
        userId: '1',
        limits: [{ category: '1', amount: 100 }],
        period: 'monthly',
        startDate: '2025-08-01',
        endDate: '2025-09-01',
        isActive: false,
      },
    ];

    jest.spyOn(Budget, 'find').mockResolvedValue(mockBudgets);

    const res = await request(app)
      .get('/api/budget/all/budgets')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono budżety');
    expect(res.body.budgets).toEqual(mockBudgets);
  });
});

describe('PUT /api/budget/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'test-user-id';
  const budgetId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 400 jeśli dane nieprzechodzą walidacji', async () => {
    const res = await request(app)
      .put(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ period: 'none' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli budżet nie istnieje', async () => {
    jest.spyOn(Budget, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        period: 'monthly',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Budżet nie znaleziony.');
  });

  it('zwraca 200 i aktualizuje budżet', async () => {
    const mockBudget = {
      _id: budgetId,
      userId,
      limits: [],
      period: 'monthly',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-08-01'),
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Budget, 'findOne').mockResolvedValue(mockBudget);

    const res = await request(app)
      .put(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        period: 'weekly',
        startDate: '2025-07-01',
        endDate: '2025-07-08',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zaktualizowano pomyślnie.');
    expect(res.body.budget).toBeDefined();
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Budget, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .put(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        period: 'weekly',
        startDate: '2025-07-01',
        endDate: '2025-07-08',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd aktualizacji budżetu');
  });
});

describe('POST /api/budget/:id/limits', () => {
  const validToken = 'mocked-token';
  const userId = 'test-user-id';
  const budgetId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app)
      .post(`/api/budget/${budgetId}/limits`)
      .send({ limits: [{ category: '1', amount: 100 }] });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nie przechodzą walidacji', async () => {
    const res = await request(app)
      .post(`/api/budget/${budgetId}/limits`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ limits: 4 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli budżet nie istnieje', async () => {
    const category = {
      id: '1',
      name: 'jedzenie',
    };

    axios.get.mockResolvedValue({ data: { category } });

    jest.spyOn(Budget, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/budget/${budgetId}/limits`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ limits: [{ category: '1', amount: 100 }] });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Nie znaleziono budżetu.');
  });

  it('zwraca 200 i zaktualizowany budżet po dodaniu limitów', async () => {
    const category = {
      id: '1',
      name: 'jedzenie',
    };

    axios.get.mockResolvedValue({ data: { category } });

    const mockBudget = {
      limits: [],
      save: jest.fn(),
    };

    jest.spyOn(Budget, 'findOne').mockResolvedValue(mockBudget);

    const res = await request(app)
      .post(`/api/budget/${budgetId}/limits`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ limits: [{ category: '1', amount: 100 }] });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Dodano limit pomyślnie.');
    expect(mockBudget.save).toHaveBeenCalled();
    expect(mockBudget.limits).toEqual([{ category: '1', amount: 100 }]);
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Budget, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .post(`/api/budget/${budgetId}/limits`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ limits: [{ category: '1', amount: 100 }] });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd dodawania limitów do budżetu');
  });
});

describe('DELETE /api/budget/:id/limit/:category', () => {
  const userId = 'mock-user-id';
  const token = 'mocked-token';
  const budgetId = '665f6e4cd3d8b942fca09876';
  const categoryId = 'abc123';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  // it('zwraca 401 jeśli brak tokenu', async () => {
  //   const mockBudget = {
  //     limits: [
  //       { category: categoryId, amount: 100 },
  //       { category: 'other', amount: 50 },
  //     ],
  //     save: jest.fn(),
  //   };

  //   jest.spyOn(Budget, 'findOne').mockResolvedValue(mockBudget);

  //   const res = await request(app).delete(`/api/budget/${budgetId}/limit/${categoryId}`);
  //   expect(res.statusCode).toBe(401);
  //   expect(res.body.message).toBe('Brak tokenu');
  // });

  it('zwraca 404 jeśli budżet nie istnieje', async () => {
    jest.spyOn(Budget, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/budget/${budgetId}/limit/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono budżetu.');
  });

  it('zwraca 200 i zapisuje zmieniony budżet', async () => {
    const mockBudget = {
      limits: [
        { category: categoryId, amount: 100 },
        { category: 'other', amount: 50 },
      ],
      save: jest.fn(),
    };

    jest.spyOn(Budget, 'findOne').mockResolvedValue(mockBudget);

    const res = await request(app)
      .delete(`/api/budget/${budgetId}/limit/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Limit został usunięty');
    expect(mockBudget.limits).toEqual([{ category: 'other', amount: 50 }]);
    expect(mockBudget.save).toHaveBeenCalled();
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Budget, 'findOne').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .delete(`/api/budget/${budgetId}/limit/${categoryId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log(res.error);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd usuwania limitu');
  });
});

describe('DELETE /api/budget/:id', () => {
  const userId = 'mock-user-id';
  const token = 'mocked-token';
  const budgetId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).delete(`/api/budget/${budgetId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli budżet nie istnieje', async () => {
    jest.spyOn(Budget, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono budżetu');
  });

  it('zwraca 200 i usuwa budżet', async () => {
    const mockBudget = {
      userId: userId,
      deleteOne: jest.fn(),
    };

    jest.spyOn(Budget, 'findOne').mockResolvedValue(mockBudget);

    const res = await request(app)
      .delete(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Budżet usunięty');
    expect(mockBudget.deleteOne).toHaveBeenCalled();
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Budget, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .delete(`/api/budget/${budgetId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd usuwania budżetu');
  });
});

describe('GET /api/budget/get/summary', () => {
  const userId = 'mock-user-id';
  const token = 'mocked-token';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).get('/api/budget/get/summary');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i podsumowanie budżetu', async () => {
    const summary = {
      totalIncome: 10000,
      totalExpenses: 4500,
      remaining: 5500,
      categoryLimits: [
        { category: 'Jedzenie', limit: 1000, spent: 800 },
        { category: 'Transport', limit: 500, spent: 300 },
      ],
    };

    jest.spyOn(Budget, 'aggregate').mockResolvedValue([
      {
        totalIncome: 10000,
        totalExpenses: 4500,
        remaining: 5500,
        categoryLimits: [
          { category: 'Jedzenie', limit: 1000, spent: 800 },
          { category: 'Transport', limit: 500, spent: 300 },
        ],
      },
    ]);

    const res = await request(app)
      .get('/api/budget/get/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toEqual(summary);
    expect(Budget.aggregate).toHaveBeenCalledWith([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalBudgets: { $sum: 1 },
          totalLimitAmount: {
            $sum: {
              $sum: '$limits.amount',
            },
          },
        },
      },
    ]);
  });

  it('zwraca 500 jeśli wystąpi błąd', async () => {
    jest.spyOn(Budget, 'aggregate').mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .get('/api/budget/get/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania podsumowania budżetów');
  });
});

describe('GET /api/budget/saving/suggestions/', () => {
  const userId = 'mock-user-id';
  const token = 'mocked-token';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).get('/api/budget/saving/suggestions/');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i wysyła sugestie', async () => {
    const mockBudgets = [
      {
        _id: 'budget123',
        isActive: true,
        userId,
        limits: [{ category: 'Jedzenie', amount: 100 }],
      },
    ];
    const mockExpenses = [{ categoryId: 'Jedzenie', amount: 90 }];

    jest.spyOn(Budget, 'find').mockResolvedValue(mockBudgets);
    axios.get.mockResolvedValue({ data: { expenses: mockExpenses } });
    notifyUser.mockResolvedValue();

    const res = await request(app)
      .get('/api/budget/saving/suggestions/')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('zwraca 500 jeśli wystąpi błąd', async () => {
    jest.spyOn(Budget, 'find').mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .get('/api/budget/saving/suggestions/')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd sugestii oszczędzania');
  });
});

describe('GET /api/budget/:id/check-limits', () => {
  const token = 'mocked-token';
  const userId = 'mock-user-id';
  const budgetId = 'budget-123';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).get(`/api/budget/${budgetId}/check-limits`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i listę przekroczonych limitów', async () => {
    const mockBudget = {
      _id: budgetId,
      userId,
      limits: [{ category: 'category1', amount: 1000 }],
    };

    const mockExpenses = [{ categoryId: 'category1', amount: 1200 }];

    jest.spyOn(Budget, 'findOne').mockResolvedValue(mockBudget);
    axios.get = jest.fn().mockResolvedValue({ data: { expenses: mockExpenses } });
    notifyUser.mockResolvedValue();

    const res = await request(app)
      .get(`/api/budget/${budgetId}/check-limits`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Przekroczono limit, wysłano powiadomienie');
    expect(notifyUser).toHaveBeenCalled();
  });

  it('zwraca 500 jeśli wystąpi błąd podczas sprawdzania limitów', async () => {
    jest.spyOn(Budget, 'findOne').mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .get(`/api/budget/${budgetId}/check-limits`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd sprawdzania limitów');
  });
});
