const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Report = require('../src/models/report.model');
const axios = require('axios');

jest.mock('axios');
jest.mock('jsonwebtoken');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/report', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).post('/api/report').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nieprzechodzą walidacji', async () => {
    const res = await request(app)
      .post('/api/report')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 500 jeśli axios rzuci wyjątek', async () => {
    axios.get.mockRejectedValue(new Error('API error'));

    const res = await request(app)
      .post('/api/report')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ from: '2024-01-01', to: '2024-12-31' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd tworzenia raportu');
  });

  it('zwraca 500 jeśli brak wydatków', async () => {
    axios.get.mockResolvedValue({ data: { expenses: [] } });

    const res = await request(app)
      .post('/api/report')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ from: '2024-01-01', to: '2024-12-31' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Brak wydatków');
  });

  it('zwraca 201 jeśli raport został utworzony', async () => {
    const mockExpenses = [
      { categoryId: '1', amount: 100 },
      { categoryId: '1', amount: 50 },
      { categoryId: '2', amount: 200 },
    ];

    axios.get.mockResolvedValue({ data: { expenses: mockExpenses } });

    axios.post.mockResolvedValue({
      data: {
        categories: [
          { id: '1', name: 'Jedzenie' },
          { id: '2', name: 'Transport' },
        ],
      },
    });

    const res = await request(app)
      .post('/api/report')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        from: '2024-01-01',
        to: '2024-12-31',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono raport');
    expect(res.body.report).toBeDefined();
  });
});

describe('GET /api/report', () => {
  const validToken = 'mocked-token';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/report');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i listę raportów', async () => {
    const res = await request(app).get('/api/report').set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono raporty');
    expect(Array.isArray(res.body.reports)).toBe(true);
  });

  it('zwraca 500 jeśli zapytanie do bazy rzuci wyjątek', async () => {
    jest.spyOn(Report, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/report').set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania raportów');
  });
});

describe('GET /api/report/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'test-user-id';
  const reportId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get(`/api/report/${reportId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli raport nie istnieje', async () => {
    jest.spyOn(Report, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/report/${reportId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono raportu');
  });

  it('zwraca 200 i raport, jeśli istnieje', async () => {
    const mockReport = {
      _id: reportId,
      userId,
      from: new Date(),
      to: new Date(),
      totalAmount: 100,
    };

    jest.spyOn(Report, 'findOne').mockResolvedValue(mockReport);

    const res = await request(app)
      .get(`/api/report/${reportId}`)
      .set('Authorization', `Bearer ${validToken}`);

    const expected = {
      ...mockReport,
      from: mockReport.from.toISOString(),
      to: mockReport.to.toISOString(),
    };

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono');
    expect(res.body.report).toMatchObject(expected);
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Report, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get(`/api/report/${reportId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania raportu');
  });
});

describe('GET /api/report/all/reports', () => {
  const validToken = 'mocked-token';

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/report/all/reports');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 403 jeśli użytkownik nie jest adminem', async () => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });

    const res = await request(app)
      .get('/api/report/all/reports')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Brak uprawnień do tego zasobu');
  });

  it('zwraca 500 jeśli zapytanie do bazy rzuci wyjątek', async () => {
    jwt.verify.mockReturnValue({ id: 'admin-id', role: 'admin' });

    jest.spyOn(Report, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/report/all/reports')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania raportów');
  });

  it('zwraca 200 i wszystkie raporty, jeśli admin', async () => {
    jwt.verify.mockReturnValue({ id: 'admin-id', role: 'admin' });

    const mockReports = [
      { _id: '1', userId: 'a', totalAmount: 100 },
      { _id: '2', userId: 'b', totalAmount: 200 },
    ];

    jest.spyOn(Report, 'find').mockResolvedValue(mockReports);

    const res = await request(app)
      .get('/api/report/all/reports')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono raporty');
    expect(res.body.reports).toEqual(mockReports);
  });
});

describe('GET /api/report/summary/yearly', () => {
  const validToken = 'mocked-token';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/report/summary/yearly');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i podsumowanie roczne raportów', async () => {
    const mockSummary = [
      { _id: { year: 2024 }, totalSpent: 500, reports: 2 },
      { _id: { year: 2023 }, totalSpent: 300, reports: 1 },
    ];

    jest.spyOn(Report, 'aggregate').mockResolvedValue(mockSummary);

    const res = await request(app)
      .get('/api/report/summary/yearly')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zestawienie roczne');
    expect(res.body.summary).toEqual(mockSummary);
  });

  it('zwraca 500 jeśli agregacja rzuci wyjątek', async () => {
    jest.spyOn(Report, 'aggregate').mockImplementation(() => {
      throw new Error('Aggregation error');
    });

    const res = await request(app)
      .get('/api/report/summary/yearly')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd agregacji raportów');
  });

  it('zwraca 200 i pustą listę jeśli nie ma raportów rocznych', async () => {
    jest.spyOn(Report, 'aggregate').mockResolvedValue([]); // brak danych

    const res = await request(app)
      .get('/api/report/summary/yearly')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zestawienie roczne');
    expect(res.body.summary).toEqual([]);
  });
});

describe('DELETE /api/report/:id', () => {
  const validToken = 'mocked-token';
  const reportId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).delete(`/api/report/${reportId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli raport nie istnieje', async () => {
    jest.spyOn(Report, 'findOneAndDelete').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/report/${reportId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono raportu');
  });

  it('zwraca 200 jeśli raport został usunięty', async () => {
    jest.spyOn(Report, 'findOneAndDelete').mockResolvedValue({
      _id: reportId,
      userId: 'test-user-id',
      totalAmount: 100,
    });

    const res = await request(app)
      .delete(`/api/report/${reportId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Raport usunięty');
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Report, 'findOneAndDelete').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .delete(`/api/report/${reportId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd usuwania raportu');
  });
});
