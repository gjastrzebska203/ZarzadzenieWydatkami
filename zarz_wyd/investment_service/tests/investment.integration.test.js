const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Investment = require('../src/models/investment.model');

jest.mock('jsonwebtoken');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/investment', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).post('/api/investment').send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nie przechodzą walidacji', async () => {
    const res = await request(app)
      .post('/api/investment')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Investment, 'create').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .post('/api/investment')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        name: 'Nowe mieszkanie',
        targetAmount: 100000,
        currentAmount: 10000,
        interestRate: 0.05,
        targetDate: '2030-01-01',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd tworzenia celu');
  });

  it('zwraca 201 jeśli inwestycja została utworzona', async () => {
    const mockInvestment = {
      _id: '665f00000000000000000001',
      userId,
      name: 'Nowe mieszkanie',
      targetAmount: 100000,
      currentAmount: 10000,
      interestRate: 0.05,
      targetDate: '2030-01-01',
    };

    jest.spyOn(Investment, 'create').mockResolvedValue(mockInvestment);

    const res = await request(app)
      .post('/api/investment')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        name: 'Nowe mieszkanie',
        targetAmount: 100000,
        currentAmount: 10000,
        interestRate: 0.05,
        targetDate: '2030-01-01',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono cel.');
    expect(res.body.investment).toMatchObject(mockInvestment);
  });
});

describe('GET /api/investment', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/investment');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Investment, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/investment')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania celów');
  });

  it('zwraca 200 i listę inwestycji', async () => {
    const mockInvestments = [
      {
        _id: '665f00000000000000000001',
        userId,
        name: 'Nowe mieszkanie',
        targetAmount: 100000,
        currentAmount: 10000,
        interestRate: 0.05,
        targetDate: '2030-01-01',
      },
    ];

    jest.spyOn(Investment, 'find').mockResolvedValue(mockInvestments);

    const res = await request(app)
      .get('/api/investment')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono cele.');
    expect(res.body.investments).toEqual(expect.arrayContaining(mockInvestments));
  });
});

describe('GET /api/investment/all/investments', () => {
  const validToken = 'mocked-token';
  const adminId = 'admin-123456';
  const userToken = 'user-token';

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/investment/all/investments');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 403 jeśli użytkownik nie ma roli admin', async () => {
    jwt.verify.mockReturnValue({ id: adminId, role: 'user' }); // brak uprawnień
    const res = await request(app)
      .get('/api/investment/all/investments')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Brak uprawnień do tego zasobu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jwt.verify.mockReturnValue({ id: adminId, role: 'admin' });

    jest.spyOn(Investment, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/investment/all/investments')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania celów');
  });

  it('zwraca 200 i listę wszystkich inwestycji jako admin', async () => {
    jwt.verify.mockReturnValue({ id: adminId, role: 'admin' });

    const mockInvestments = [
      {
        _id: '665f00000000000000000001',
        userId: 'user1',
        name: 'Test inwestycja',
        targetAmount: 5000,
        currentAmount: 1000,
        interestRate: 0.1,
        targetDate: '2031-12-31',
      },
    ];

    jest.spyOn(Investment, 'find').mockResolvedValue(mockInvestments);

    const res = await request(app)
      .get('/api/investment/all/investments')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono cele.');
    expect(res.body.investments).toEqual(expect.arrayContaining(mockInvestments));
  });
});

describe('GET /api/investment/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';
  const investmentId = '665f00000000000000000001';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get(`/api/investment/${investmentId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli inwestycja nie istnieje lub nie należy do użytkownika', async () => {
    jest.spyOn(Investment, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/investment/${investmentId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono celu.');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Investment, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get(`/api/investment/${investmentId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania celu');
  });

  it('zwraca 200 i inwestycję jeśli istnieje i należy do użytkownika', async () => {
    const mockInvestment = {
      _id: investmentId,
      userId,
      name: 'Nowe mieszkanie',
      targetAmount: 100000,
      currentAmount: 10000,
      interestRate: 0.05,
      targetDate: '2030-01-01',
    };

    jest.spyOn(Investment, 'findOne').mockResolvedValue(mockInvestment);

    const res = await request(app)
      .get(`/api/investment/${investmentId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono cel.');
    expect(res.body.investment).toEqual(mockInvestment);
  });
});

describe('GET /api/investment/get/summary', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/investment/get/summary');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Investment, 'aggregate').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/investment/get/summary')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd agregacji inwestycji');
  });

  it('zwraca 200 i podsumowanie inwestycji', async () => {
    const mockSummary = [
      {
        totalTarget: 100000,
        totalCurrent: 30000,
        soonestTargetDate: '2030-01-01',
        progress: 0.3,
      },
    ];

    jest.spyOn(Investment, 'aggregate').mockResolvedValue(mockSummary);

    const res = await request(app)
      .get('/api/investment/get/summary')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Podsumowanie inwestycji');
    expect(res.body.summary).toEqual(mockSummary[0]);
  });

  it('zwraca puste podsumowanie jeśli użytkownik nie ma inwestycji', async () => {
    jest.spyOn(Investment, 'aggregate').mockResolvedValue([]);

    const res = await request(app)
      .get('/api/investment/get/summary')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Podsumowanie inwestycji');
    expect(res.body.summary).toEqual({
      totalTarget: 0,
      totalCurrent: 0,
      progress: 0,
      soonestTargetDate: null,
    });
  });
});

describe('GET /api/investment/:id/simulate', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';
  const investmentId = '665f00000000000000000001';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get(`/api/investment/${investmentId}/simulate`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli nie znaleziono celu', async () => {
    jest.spyOn(Investment, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/investment/${investmentId}/simulate`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono celu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Investment, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get(`/api/investment/${investmentId}/simulate`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd przeprowadzania symulacji');
  });

  it('zwraca 200 i dane symulacji', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);

    const mockInvestment = {
      _id: investmentId,
      userId,
      name: 'Nowe mieszkanie',
      targetAmount: 100000,
      currentAmount: 20000,
      interestRate: 0.05,
      targetDate: futureDate,
    };

    jest.spyOn(Investment, 'findOne').mockResolvedValue(mockInvestment);

    const res = await request(app)
      .get(`/api/investment/${investmentId}/simulate`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Wykonano symulację.');

    // Przerób porównanie na jawne porównanie pól, serializując datę:
    expect(res.body.investment).toMatchObject({
      ...mockInvestment,
      targetDate: mockInvestment.targetDate.toISOString(),
    });

    expect(res.body.simulation).toHaveProperty('futureValue');
    expect(res.body.simulation.progress).toBeCloseTo(20);
  });
});

describe('PUT /api/investment/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';
  const investmentId = '665f00000000000000000001';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).put(`/api/investment/${investmentId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli walidacja nie przejdzie', async () => {
    const res = await request(app)
      .put(`/api/investment/${investmentId}`)
      .send({ name: 5 })
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 404 jeśli nie znaleziono celu', async () => {
    jest.spyOn(Investment, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/investment/${investmentId}`)
      .send({
        name: 'Zmieniony cel',
        targetAmount: 50000,
      })
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono celu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Investment, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .put(`/api/investment/${investmentId}`)
      .send({ name: 'Dowolna nazwa' })
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd aktualizacji celu');
  });

  it('zwraca 200 i zaktualizowany cel', async () => {
    const mockInvestment = {
      _id: investmentId,
      userId,
      name: 'Stara nazwa',
      targetAmount: 100000,
      currentAmount: 20000,
      interestRate: 0.05,
      targetDate: new Date('2030-06-08T00:00:00.000Z'),
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Investment, 'findOne').mockResolvedValue(mockInvestment);

    const res = await request(app)
      .put(`/api/investment/${investmentId}`)
      .send({
        name: 'Nowe mieszkanie',
        targetAmount: 120000,
        currentAmount: 25000,
        interestRate: 0.06,
        targetDate: '2031-01-01',
      })
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zaktualizowano cel');
    expect(mockInvestment.save).toHaveBeenCalled();
    expect(res.body.investment).toMatchObject({
      name: 'Nowe mieszkanie',
      targetAmount: 120000,
      currentAmount: 25000,
      interestRate: 0.06,
      targetDate: '2031-01-01',
    });
  });
});

describe('DELETE /api/investment/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';
  const investmentId = '665f00000000000000000001';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).delete(`/api/investment/${investmentId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Investment, 'findOneAndDelete').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .delete(`/api/investment/${investmentId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd usuwania celu');
  });

  it('zwraca 404 jeśli inwestycja nie istnieje', async () => {
    jest.spyOn(Investment, 'findOneAndDelete').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/investment/${investmentId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono celu.');
  });

  it('zwraca 200 jeśli usunięto cel', async () => {
    const mockDeletedInvestment = {
      _id: investmentId,
      userId,
      name: 'Nowe mieszkanie',
    };

    jest.spyOn(Investment, 'findOneAndDelete').mockResolvedValue(mockDeletedInvestment);

    const res = await request(app)
      .delete(`/api/investment/${investmentId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Usunięto cel inwestycyjny');
  });
});
