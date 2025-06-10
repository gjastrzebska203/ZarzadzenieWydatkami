const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Account = require('../src/models/account.model');

jest.mock('axios');
jest.mock('jsonwebtoken');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/account', () => {
  const validToken = 'mocked-token';
  const userId = 'f37553fe-77c2-4f51-a51f-03b6857b5683';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).post('/api/account').send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 400 jeśli dane nieprzechodzą walidacji', async () => {
    const res = await request(app)
      .post('/api/account')
      .set('Authorization', `Bearer ${validToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 201 jeśli rachunek został utworzony', async () => {
    const account = {
      name: 'karta test',
      type: 'card',
      currency: 'pln',
      balance: 1000.57,
      isActive: true,
    };

    const res = await request(app)
      .post('/api/account')
      .set('Authorization', `Bearer ${validToken}`)
      .send(account);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Utworzono rachunek');
    expect(res.body.account).toBeDefined();
  });
});

describe('GET /api/account', () => {
  const validToken = 'mocked-token';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/account');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i listę rachunków', async () => {
    const res = await request(app).get('/api/account').set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono rachunki');
    expect(Array.isArray(res.body.accounts)).toBe(true);
  });

  it('zwraca 500 jeśli zapytanie do bazy rzuci wyjątek', async () => {
    jest.spyOn(Account, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/account').set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania rachunków');
  });
});

describe('GET /api/account/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'test-user-id';
  const accountId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get(`/api/account/${accountId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli account nie istnieje', async () => {
    jest.spyOn(Account, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono rachunku');
  });

  it('zwraca 200 i rachunek, jeśli istnieje', async () => {
    const mockAccount = {
      _id: accountId,
      name: 'karta test',
      type: 'card',
      currency: 'pln',
      balance: 1000.57,
      isActive: true,
    };

    jest.spyOn(Account, 'findOne').mockResolvedValue(mockAccount);

    const res = await request(app)
      .get(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono rachunek');
    expect(res.body.account).toMatchObject(mockAccount);
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Account, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania rachunku');
  });
});

describe('GET /api/account/all/accounts', () => {
  const validToken = 'mocked-token';

  it('zwraca 401 jeśli nie ma tokenu', async () => {
    const res = await request(app).get('/api/account/all/accounts');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 403 jeśli użytkownik nie jest adminem', async () => {
    jwt.verify.mockReturnValue({ id: 'test-user-id', role: 'user' });

    const res = await request(app)
      .get('/api/account/all/accounts')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Brak uprawnień do tego zasobu');
  });

  it('zwraca 500 jeśli zapytanie do bazy rzuci wyjątek', async () => {
    jwt.verify.mockReturnValue({ id: 'admin-id', role: 'admin' });

    jest.spyOn(Account, 'find').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/account/all/accounts')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd pobierania rachunków');
  });

  it('zwraca 200 i wszystkie accounty, jeśli admin', async () => {
    jwt.verify.mockReturnValue({ id: 'admin-id', role: 'admin' });

    const mockAccounts = [
      {
        _id: 'a1',
        userId: 'u1',
        name: 'karta test',
        type: 'card',
        currency: 'pln',
        balance: 1000.57,
        isActive: true,
      },
      {
        _id: 'a2',
        userId: 'u2',
        name: 'karta test',
        type: 'card',
        currency: 'pln',
        balance: 1000.57,
        isActive: true,
      },
    ];

    jest.spyOn(Account, 'find').mockResolvedValue(mockAccounts);

    const res = await request(app)
      .get('/api/account/all/accounts')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Znaleziono rachunki');
    expect(res.body.accounts).toEqual(mockAccounts);
  });
});

describe('PUT /api/account/:id', () => {
  const validToken = 'mocked-token';
  const userId = 'test-user-id';
  const accountId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 400 jeśli dane nieprzechodzą walidacji', async () => {
    const res = await request(app)
      .put(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({ type: 'none' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Błąd walidacji');
  });

  it('zwraca 404 jeśli rachunek nie istnieje', async () => {
    jest.spyOn(Account, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        type: 'cash',
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono rachunku');
  });

  it('zwraca 200 i aktualizuje rachunek', async () => {
    const mockAccount = {
      _id: 'a2',
      userId: 'u2',
      name: 'karta test',
      type: 'card',
      currency: 'pln',
      balance: 1000.57,
      isActive: true,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(Account, 'findOne').mockResolvedValue(mockAccount);

    const res = await request(app)
      .put(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        type: 'cash',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Zaktualizowano pomyślnie.');
    expect(res.body.account).toBeDefined();
  });

  it('zwraca 500 jeśli wystąpi wyjątek', async () => {
    jest.spyOn(Account, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .put(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        type: 'cash',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd aktualizacji rachunku');
  });
});

describe('DELETE /api/account/:id', () => {
  const userId = 'mock-user-id';
  const token = 'mocked-token';
  const accountId = '665f6e4cd3d8b942fca09876';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).delete(`/api/account/${accountId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 404 jeśli rachunek nie istnieje', async () => {
    jest.spyOn(Account, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Nie znaleziono rachunku');
  });

  it('zwraca 200 i usuwa rachunek', async () => {
    const mockaccount = {
      userId: userId,
      deleteOne: jest.fn(),
    };

    jest.spyOn(Account, 'findOne').mockResolvedValue(mockaccount);

    const res = await request(app)
      .delete(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Rachunek usunięty');
    expect(mockaccount.deleteOne).toHaveBeenCalled();
  });

  it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
    jest.spyOn(Account, 'findOne').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .delete(`/api/account/${accountId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd usuwania rachunku');
  });
});

describe('GET /api/account/total/balance', () => {
  const validToken = 'mocked-token';
  const userId = 'mock-user-id';

  beforeEach(() => {
    jwt.verify.mockReturnValue({ id: userId, role: 'user' });
  });

  it('zwraca 401 jeśli brak tokenu', async () => {
    const res = await request(app).get('/api/account/total/balance');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Brak tokenu');
  });

  it('zwraca 200 i poprawne totalBalance', async () => {
    const mockResult = [{ _id: null, totalBalance: 1550.75 }];

    jest.spyOn(Account, 'aggregate').mockResolvedValue(mockResult);

    const res = await request(app)
      .get('/api/account/total/balance')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalBalance).toBe(1550.75);
    expect(Account.aggregate).toHaveBeenCalledWith([
      { $match: { userId: userId } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
    ]);
  });

  it('zwraca 200 i totalBalance = 0 jeśli brak danych', async () => {
    jest.spyOn(Account, 'aggregate').mockResolvedValue([]);

    const res = await request(app)
      .get('/api/account/total/balance')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalBalance).toBe(0);
  });

  it('zwraca 500 jeśli wystąpi wyjątek w agregacji', async () => {
    jest.spyOn(Account, 'aggregate').mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .get('/api/account/total/balance')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe('Błąd agregacji salda');
  });
});

// describe('POST /api/account/transfer', () => {
//   const token = 'mocked-token';
//   const userId = 'mock-user-id';

//   beforeEach(() => {
//     jwt.verify.mockReturnValue({ id: userId, role: 'user' });
//   });

//   it('zwraca 401 jeśli brak tokenu', async () => {
//     const res = await request(app).post('/api/account/transfer');
//     expect(res.statusCode).toBe(401);
//     expect(res.body.message).toBe('Brak tokenu');
//   });

//   it('zwraca 400 jeśli dane nie przechodzą walidacji', async () => {
//     const res = await request(app)
//       .post('/api/account/transfer')
//       .set('Authorization', `Bearer ${token}`)
//       .send({}); // brak wymaganych pól

//     expect(res.statusCode).toBe(400);
//     expect(res.body.message).toBe('Błąd walidacji');
//   });

//   it('zwraca 404 jeśli brak środków', async () => {
//     const from = {
//       _id: 'from-id',
//       userId,
//       balance: 50,
//     };

//     const to = { _id: 'to-id', userId, balance: 0 };

//     jest
//       .spyOn(Account, 'findOne')
//       .mockResolvedValueOnce({ _id: 'from-id', userId, balance: 50 }) // źródłowe konto
//       .mockResolvedValueOnce({ _id: 'to-id', userId, balance: 0 }); // docelowe konto

//     const res = await request(app)
//       .post('/api/account/transfer')
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         fromAccountId: 'from-id',
//         toAccountId: 'to-id',
//         amount: 100,
//       });

//     expect(res.statusCode).toBe(404);
//     expect(res.body.message).toBe('Brak środków na koncie źródłowym');
//   });

//   it('zwraca 200 jeśli transfer zakończy się sukcesem', async () => {
//     const from = {
//       _id: 'from-id',
//       userId,
//       balance: 200,
//       save: jest.fn().mockResolvedValue(true),
//     };

//     const to = {
//       _id: 'to-id',
//       userId,
//       balance: 100,
//       save: jest.fn().mockResolvedValue(true),
//     };

//     jest.spyOn(Account, 'findOne').mockResolvedValueOnce(from).mockResolvedValueOnce(to);

//     const res = await request(app)
//       .post('/api/account/transfer')
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         fromAccountId: 'from-id',
//         toAccountId: 'to-id',
//         amount: 50,
//       });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.message).toBe('Transfer zakończony sukcesem');
//     expect(from.balance).toBe(150);
//     expect(to.balance).toBe(150);
//     expect(from.save).toHaveBeenCalled();
//     expect(to.save).toHaveBeenCalled();
//   });

//   it('zwraca 500 jeśli wystąpi błąd serwera', async () => {
//     jest.spyOn(Account, 'findOne').mockImplementation(() => {
//       throw new Error('DB error');
//     });

//     const res = await request(app)
//       .post('/api/account/transfer')
//       .set('Authorization', `Bearer ${token}`)
//       .send({
//         fromAccountId: 'from-id',
//         toAccountId: 'to-id',
//         amount: 50,
//       });

//     expect(res.statusCode).toBe(500);
//     expect(res.body.message).toBe('Błąd transferu środków');
//   });
// });
