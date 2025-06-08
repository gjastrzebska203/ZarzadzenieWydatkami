const { sequelize, testConnection } = require('../src/config/db');

describe('Poprawne połączenie z bazą danych', () => {
  it('powinno połączyć się z bazą danych bez błędów', async () => {
    await expect(testConnection()).resolves.toBeUndefined();
  });

  it('sequelize powinien być zainicjalizowany poprawnie', () => {
    expect(sequelize).toBeDefined();
    expect(typeof sequelize.authenticate).toBe('function');
  });
});

describe('Błędne połączenie z bazą danych', () => {
  it('powinno rzucić błąd połączenia', async () => {
    const originalAuthenticate = sequelize.authenticate;
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    sequelize.authenticate = jest.fn(() => {
      throw new Error('Symulowany błąd połączenia');
    });

    await testConnection();

    expect(exitSpy).toHaveBeenCalledWith(1);

    sequelize.authenticate = originalAuthenticate;
    exitSpy.mockRestore();
  });
});

afterAll(async () => {
  await sequelize.close();
});
