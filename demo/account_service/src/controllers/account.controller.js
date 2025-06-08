const { validationResult } = require('express-validator');
const Account = require('../models/account.model');

const createAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { name, type, currency, balance, isActive } = req.body;

    const account = await Account.create({
      userId: req.user.id,
      name,
      type,
      currency: currency.toUpperCase(),
      balance,
      isActive,
    });
    return res.status(201).json({ message: 'Utworzono rachunek', account });
  } catch (err) {
    const error = new Error('Błąd tworzenia rachunku: ');
    error.details = err.message;
    next(error);
  }
};

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user.id });
    return res.status(200).json({ message: 'Znaleziono rachunki.', accounts });
  } catch (err) {
    const error = new Error('Błąd pobierania rachunków');
    error.details = err.message;
    next(error);
  }
};

const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find();
    return res.status(200).json({ message: 'Znaleziono rachunki.', accounts });
  } catch (err) {
    const error = new Error('Błąd pobierania rachunków');
    error.details = err.message;
    next(error);
  }
};

const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      const error = new Error('Nie znaleziono rachunku');
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({ message: 'Znaleziono rachunek.', account });
  } catch (err) {
    const error = new Error('Błąd pobierania rachunku');
    error.details = err.message;
    next(error);
  }
};

const getTotalBalance = async (req, res, next) => {
  try {
    const result = await Account.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$balance' },
        },
      },
    ]);

    const total = result[0]?.totalBalance || 0;
    res.status(200).json({ totalBalance: total });
  } catch (err) {
    const error = new Error('Błąd agregacji salda');
    error.details = err.message;
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      const error = new Error('Nie znaleziono rachunku');
      error.status = 404;
      return next(error);
    }
    const { name, type, currency, balance, isActive } = req.body;
    account.name = name ?? account.name;
    account.type = type ?? account.type;
    account.currency = currency ?? account.currency;
    account.balance = balance ?? account.balance;
    account.isActive = isActive ?? account.isActive;
    await account.save();
    res.status(200).json({ message: 'Zaktualizowano pomyślnie.', account });
  } catch (err) {
    const error = new Error('Błąd aktualizacji rachunku');
    error.details = err.message;
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!account) {
      const error = new Error('Nie znaleziono rachunku');
      error.status = 404;
      return next(error);
    }
    await account.deleteOne();
    return res.status(200).json({ message: 'Rachunek usunięty' });
  } catch (err) {
    const error = new Error('Błąd usuwania rachunku');
    error.details = err.message;
    next(error);
  }
};

const transferFunds = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { fromAccountId, toAccountId, amount } = req.body;
    const from = await Account.findOne({ _id: fromAccountId, userId: req.user.id });
    const to = await Account.findOne({ _id: toAccountId, userId: req.user.id });

    if (from.balance < amount) {
      const error = new Error('Brak środków na koncie źródłowym');
      error.status = 404;
      return next(error);
    }

    from.balance -= amount;
    to.balance += amount;

    await from.save();
    await to.save();

    res.status(200).json({ message: 'Transfer zakończony sukcesem', from, to });
  } catch (err) {
    const error = new Error('Błąd transferu środków');
    error.details = err.message;
    next(error);
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  getAllAccounts,
  getTotalBalance,
  updateAccount,
  deleteAccount,
  transferFunds,
};
