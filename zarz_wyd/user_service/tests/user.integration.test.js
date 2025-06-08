const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-token'),
  verify: jest.fn(() => ({ id: 'f37553fe-77c2-4f51-a51f-03b6857b5683', role: 'user' })),
}));

const { User } = require('../src/models');
const { sequelize } = require('../src/config/db');
const request = require('supertest');
const app = require('../src/app');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/user/register', () => {
  it('zwraca 400 jeśli id jest niepoprawne', async () => {
    const res = await request(app).post('/api/user/register').send({
      id: '2',
      email: 'test@gmail.com',
      password: 'Testowo1!',
      full_name: 'Jan Kowalski',
      language: 'pl',
      currency: 'pln',
      role: 'user',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli email jest niepoprawny', async () => {
    const res = await request(app).post('/api/user/register').send({
      email: 'not.an.email',
      password: 'Testowo1!',
      full_name: 'Jan Kowalski',
      language: 'pl',
      currency: 'pln',
      role: 'user',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli hasło jest niepoprawne', async () => {
    const res = await request(app).post('/api/user/register').send({
      email: 'test@gmail.com',
      password: 'test',
      full_name: 'Jan Kowalski',
      language: 'pl',
      currency: 'pln',
      role: 'user',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli imię i nazwisko są niepoprawne', async () => {
    const res = await request(app).post('/api/user/register').send({
      email: 'test@gmail.com',
      password: 'Testowo1!',
      full_name: 1,
      language: 'pl',
      currency: 'pln',
      role: 'user',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli język jest niepoprawny', async () => {
    const res = await request(app).post('/api/user/register').send({
      email: 'test@gmail.com',
      password: 'Testowo1!',
      full_name: 'Jan Kowalski',
      language: 'test',
      currency: 'pln',
      role: 'user',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli waluta jest niepoprawna', async () => {
    const res = await request(app).post('/api/user/register').send({
      email: 'test@gmail.com',
      password: 'Testowo1!',
      full_name: 'Jan Kowalski',
      language: 'pl',
      currency: 'test',
      role: 'user',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli rola jest niepoprawna', async () => {
    const res = await request(app).post('/api/user/register').send({
      email: 'test@gmail.com',
      password: 'Testowo1!',
      full_name: 'Jan Kowalski',
      language: 'pl',
      currency: 'pln',
      role: 'test',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 500 jeśli wystąpi błąd podczas rejestracji', async () => {
    const originalCreate = User.create;
    User.create = jest.fn(() => {
      throw new Error('DB error');
    });

    const res = await request(app).post('/api/user/register').send({
      id: 'b0d634cd-6e3e-49f8-a7d5-e68f93bb3a02',
      email: 'blad@rejestracja.com',
      password: 'Testowo1!',
      full_name: 'Testowy Błąd',
      language: 'pl',
      currency: 'pln',
      role: 'user',
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd rejestracji');

    User.create = originalCreate;
  });

  it('zwraca 201 jeśli utworzono konto user', async () => {
    const res = await request(app).post('/api/user/register').send({
      id: 'f37553fe-77c2-4f51-a51f-03b6857b5683',
      email: 'test@gmail.com',
      password: 'Testowo1!',
      full_name: 'Jan Kowalski',
      language: 'pl',
      currency: 'pln',
      role: 'user',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono konto');
  });

  it('zwraca 201 jeśli utworzono konto admin', async () => {
    const res = await request(app).post('/api/user/register').send({
      id: '7137dee8-0669-4cbb-8c42-1907059b90c7',
      email: 'test_admin@gmail.com',
      password: 'TestowoAdmin1!',
      full_name: 'Jan Kowalski',
      language: 'pl',
      currency: 'pln',
      role: 'admin',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono konto');
  });
});

describe('POST /api/user/login', () => {
  it('zwraca 400 jeśli email jest niepoprawny', async () => {
    const res = await request(app).post('/api/user/login').send({
      email: 'not.an.email',
      password: 'Testowo1!',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli nie ma hasła', async () => {
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli email nie znajduje się w bazie', async () => {
    const res = await request(app).post('/api/user/login').send({
      email: 'not.in.db@gmail.com',
      password: 'Testowo1!',
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Nieprawidłowy email lub hasło');
  });

  it('zwraca 400 jeśli błędne hasło', async () => {
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'Wrong1!',
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Nieprawidłowy email lub hasło');
  });

  it('zwraca 200 jeśli użytkownik się zaloguje', async () => {
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'Testowo1!',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zalogowano pomyślnie');
  });
});

describe('POST /api/user/forgot-password', () => {
  it('zwraca 400 jeśli email jest niepoprawny', async () => {
    const res = await request(app).post('/api/user/forgot-password').send({
      email: 'not.an.email',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 500 jesli nie ma użytkownika', async () => {
    const res = await request(app).post('/api/user/forgot-password').send({
      email: 'wrong@gmail.com',
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Konto nie znalezione');
  });

  it('zwraca 200 jesli wysłano link resetujący', async () => {
    const res = await request(app).post('/api/user/forgot-password').send({
      email: 'test@gmail.com',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Rozpoczęto reset hasła');
  });
});

describe('POST /api/user/reset-password', () => {
  it('zwraca 400 jeśli hasło jest niepoprawne', async () => {
    const res = await request(app).post('/api/user/reset-password').send({
      newPassword: 'test',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 400 jeśli brak tokenu', async () => {
    const res = await request(app).post('/api/user/reset-password').send({
      newPassword: 'noweHasło1!',
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd reset password');
  });

  it('zwraca 400 jeśli błędny token', async () => {
    const res = await request(app).post('/api/user/reset-password').send({
      token: '1',
      newPassword: 'noweHasło1!',
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd reset password');
  });
});

describe('GET /api/user/me', () => {
  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).get('/api/user/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli brak użytkownika', async () => {
    jest.mock('jsonwebtoken', () => ({
      sign: jest.fn(() => 'mocked-token'),
      verify: jest.fn(() => ({ id: 'f37553fe-77c2-4f51-a51f-03b6857b5680', role: 'user' })),
    }));

    const res = await request(app).get('/api/user/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 jeśli token jest poprawny', async () => {
    const res = await request(app).get('/api/user/me').set('Authorization', `Bearer mocked-token`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono użytkownika');
  });
});

describe('PUT /api/user/change-password', () => {
  it('zwraca 400 jeśli hasło jest niepoprawne', async () => {
    const res = await request(app)
      .put('/api/user/change-password')
      .set('Authorization', 'Bearer mocked-token')
      .send({
        currentPassword: 'Testowo1!',
        newPassword: 'short',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });
});

describe('PUT /api/user/change-password', () => {
  it('zwraca 400 jeśli nowe hasło nie spełnia wymagań', async () => {
    const res = await request(app)
      .put('/api/user/change-password')
      .set('Authorization', 'Bearer mocked-token')
      .send({
        currentPassword: 'Testowo1!',
        newPassword: '123',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 500 jeśli obecne hasło jest nieprawidłowe', async () => {
    const res = await request(app)
      .put('/api/user/change-password')
      .set('Authorization', 'Bearer mocked-token')
      .send({
        currentPassword: 'ZleHaslo1!',
        newPassword: 'NoweHaslo1!',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd zmiany hasła');
  });
});

describe('GET /api/user/', () => {
  it('zwraca 403 jeśli użytkownik nie jest adminem', async () => {
    const res = await request(app).get('/api/user/').set('Authorization', 'Bearer mocked-token');
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Brak uprawnień do tego zasobu');
  });

  it('zwraca 200 jeśli użytkownik jest adminem', async () => {
    require('jsonwebtoken').verify.mockReturnValue({
      id: '7137dee8-0669-4cbb-8c42-1907059b90c7',
      role: 'admin',
    });

    const res = await request(app).get('/api/user/').set('Authorization', 'Bearer mocked-token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
  });
});

describe('PUT /api/user/me', () => {
  it('zwraca 400 jeśli email jest niepoprawny', async () => {
    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', 'Bearer mocked-token')
      .send({
        email: 'not.an.email',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 200 jeśli profil został zaktualizowany', async () => {
    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', 'Bearer mocked-token')
      .send({ full_name: 'Nowe Imię' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zaktualizowano pomyślnie.');
  });
});

describe('DELETE /api/user/me', () => {
  it('zwraca 200 jeśli konto zostało usunięte', async () => {
    const res = await request(app)
      .delete('/api/user/me')
      .set('Authorization', 'Bearer mocked-token');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Konto zostało usunięte.');
  });

  it('zwraca 500 jeśli użytkownik nie istnieje', async () => {
    const jwt = require('jsonwebtoken');
    jwt.verify.mockReturnValueOnce({ id: '00000000-0000-0000-0000-000000000000', role: 'user' });

    const res = await request(app)
      .delete('/api/user/me')
      .set('Authorization', 'Bearer mocked-token');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Użytkownik nie znaleziony');
  });
});
