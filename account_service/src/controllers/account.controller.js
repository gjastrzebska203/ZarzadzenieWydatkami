const { validationResult } = require('express-validator');
const Account = require('../models/account.model');

const createAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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
    return res.status(201).json({ message: 'Utworzono rachunek.', account });
  } catch (error) {
    console.error('Błąd tworzenia rachunku: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia rachunku.' });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id });
    return res.status(200).json({ message: 'Znaleziono rachunki.', accounts });
  } catch (error) {
    console.error('Błąd pobierania rachunków: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania rachunków.' });
  }
};

const getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Nie znaleziono rachunku' });
    return res.status(200).json({ message: 'Znaleziono rachunek.', account });
  } catch (error) {
    console.error('Błąd pobierania rachunku: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania rachunku.' });
  }
};

const updateAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Rachunek nie znaleziony.' });
    }
    const { name, type, currency, balance, isActive } = req.body;
    account.name = name ?? account.name;
    account.type = type ?? account.type;
    account.currency = currency ?? account.currency;
    account.balance = balance ?? account.balance;
    account.isActive = isActive ?? account.isActive;
    await account.save();
    res.status(200).json({ message: 'Zaktualizowano pomyślnie.', account });
  } catch (error) {
    console.error('Błąd aktualizacji rachunku: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji rachunku.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!account) {
      return res.status(404).json({ message: 'Rachunek nie znaleziony' });
    }
    await account.deleteOne();
    return res.status(200).json({ message: 'Rachunek usunięty' });
  } catch (error) {
    console.error('Błąd usuwania rachunku: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania rachunku.' });
  }
};

const transferFunds = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fromAccountId, toAccountId, amount } = req.body;
    const from = await Account.findOne({ _id: fromAccountId, userId: req.user.id });
    const to = await Account.findOne({ _id: toAccountId, userId: req.user.id });

    if (from.balance < amount)
      return res.status(400).json({ message: 'Brak środków na koncie źródłowym' });

    from.balance -= amount;
    to.balance += amount;

    await from.save();
    await to.save();

    res.status(200).json({ message: 'Transfer zakończony sukcesem', from, to });
  } catch (error) {
    console.error('Błąd usuwania rachunku: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania rachunku.' });
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  transferFunds,
};
