const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Notification = require('../src/models/notifications.model');

jest.mock('jsonwebtoken');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/notifications', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).post('/api/notifications').send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nieprzechodzą walidacji', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Notification, 'create').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        type: 'budget',
        title: 'Test',
        message: 'To jest testowe powiadomienie',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd tworzenia powiadomienie');
  });

  it('zwraca 201 jeśli powiadomienie zostało utworzone', async () => {
    const mockNotification = {
      _id: '665f1234567890abcdef1234',
      userId,
      type: 'budget',
      title: 'Test',
      message: 'To jest testowe powiadomienie',
    };

    jest.spyOn(Notification, 'create').mockResolvedValue(mockNotification);

    const res = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        type: 'budget',
        title: 'Test',
        message: 'To jest testowe powiadomienie',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono powiadomienie.');
    expect(res.body.notification).toMatchObject(mockNotification);
  });
});

describe('GET /api/notifications', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Notification, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania powiadomień');
  });

  it('zwraca 200 i listę powiadomień', async () => {
    const mockNotifications = [
      {
        _id: '1',
        userId,
        type: 'budget',
        title: 'Test 1',
        message: 'Powiadomienie 1',
      },
      {
        _id: '2',
        userId,
        type: 'payment',
        title: 'Test 2',
        message: 'Powiadomienie 2',
      },
    ];

    jest.spyOn(Notification, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockNotifications),
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono powiadomienia.');
    expect(res.body.notifications).toEqual(expect.arrayContaining(mockNotifications));
  });
});

describe('GET /api/notifications', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Notification, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania powiadomień');
  });

  it('zwraca 200 i listę powiadomień', async () => {
    const mockNotifications = [
      {
        _id: '1',
        userId,
        type: 'budget',
        title: 'Test 1',
        message: 'Powiadomienie 1',
      },
      {
        _id: '2',
        userId,
        type: 'payment',
        title: 'Test 2',
        message: 'Powiadomienie 2',
      },
    ];

    jest.spyOn(Notification, 'find').mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockNotifications),
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono powiadomienia.');
    expect(res.body.notifications).toEqual(expect.arrayContaining(mockNotifications));
  });
});

describe('GET /api/notifications/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';
  const notificationId = '665f1234567890abcdef1234';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get(`/api/notifications/${notificationId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli nie znaleziono powiadomienia', async () => {
    jest.spyOn(Notification, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono powiadomienia');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Notification, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania powiadomienia');
  });

  it('zwraca 200 jeśli powiadomienie zostało znalezione', async () => {
    const mockNotification = {
      _id: notificationId,
      userId,
      type: 'budget',
      title: 'Test',
      message: 'To jest testowe powiadomienie',
    };

    jest.spyOn(Notification, 'findOne').mockResolvedValue(mockNotification);

    const res = await request(app)
      .get(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono powiadomienie');
    expect(res.body.notification).toMatchObject(mockNotification);
  });
});

describe('GET /api/notifications/unread/count', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/notifications/unread/count');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 500 jeśli agregacja rzuca wyjątek', async () => {
    jest.spyOn(Notification, 'aggregate').mockRejectedValue(new Error('Aggregation error'));

    const res = await request(app)
      .get('/api/notifications/unread/count')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd agregacji');
  });

  it('zwraca 0 jeśli nie ma nieprzeczytanych powiadomień', async () => {
    jest.spyOn(Notification, 'aggregate').mockResolvedValue([]);

    const res = await request(app)
      .get('/api/notifications/unread/count')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Liczba nieprzeczytanych powiadomień');
    expect(res.body.count).toBe(0);
  });

  it('zwraca poprawną liczbę nieprzeczytanych powiadomień', async () => {
    jest.spyOn(Notification, 'aggregate').mockResolvedValue([{ _id: null, count: 3 }]);

    const res = await request(app)
      .get('/api/notifications/unread/count')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Liczba nieprzeczytanych powiadomień');
    expect(res.body.count).toBe(3);
  });
});

describe('PUT /api/notifications/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';
  const notificationId = '665f1234567890abcdef1234';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).put(`/api/notifications/${notificationId}`).send({});
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nie przechodzą walidacji', async () => {
    const res = await request(app)
      .put(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ type: 'invalid-type' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 404 jeśli powiadomienie nie istnieje', async () => {
    jest.spyOn(Notification, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Nowy tytuł' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono powiadomienia');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Notification, 'findOne').mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ title: 'Nowy tytuł' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd aktualizacji powiadomienia');
  });

  it('zwraca 200 i zaktualizowane powiadomienie', async () => {
    const mockNotification = {
      _id: notificationId,
      userId,
      type: 'budget',
      title: 'Stary tytuł',
      message: 'Stara wiadomość',
      isRead: false,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Notification, 'findOne').mockResolvedValue(mockNotification);

    const res = await request(app)
      .put(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        title: 'Zaktualizowany tytuł',
        message: 'Nowa wiadomość',
        isRead: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zaktualizowano powiadomienie.');
    expect(res.body.notification.title).toBe('Zaktualizowany tytuł');
    expect(res.body.notification.message).toBe('Nowa wiadomość');
    expect(res.body.notification.isRead).toBe(true);
  });
});

describe('DELETE /api/notifications/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';
  const notificationId = '665f1234567890abcdef1234';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).delete(`/api/notifications/${notificationId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli powiadomienie nie istnieje', async () => {
    jest.spyOn(Notification, 'findOneAndDelete').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono powiadomienia');
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Notification, 'findOneAndDelete').mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd usuwania powiadomienia');
  });

  it('zwraca 200 jeśli powiadomienie zostało usunięte', async () => {
    const mockNotification = {
      _id: notificationId,
      userId,
      type: 'budget',
      title: 'Do usunięcia',
      message: 'To jest testowe powiadomienie',
    };

    jest.spyOn(Notification, 'findOneAndDelete').mockResolvedValue(mockNotification);

    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Usunięto powiadomienie');
  });
});
