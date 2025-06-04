const { validationResult } = require('express-validator');
const Expense = require('../models/expense.model');

const createExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { amount, categoryId, budgetId, accountId, date, note, tags } = req.body;
    const expense = new Expense({
      userId: req.user.id,
      amount,
      categoryId,
      budgetId,
      accountId,
      date,
      note,
      tags: tags ? tags : [],
    });
    await expense.save();
    return res.status(201).json({ message: 'Utworzono wydatek.', expense });
  } catch (err) {
    const error = new Error('Błąd tworzenia wydatku');
    error.details = err.message;
    next(error);
  }
};

const getExpenses = async (req, res) => {
  try {
    const { budgetId, from, to } = req.query;
    const query = {
      userId: req.user.id,
    };

    if (budgetId) query.budgetId = budgetId;
    if (from && to) query.date = { $gte: new Date(from), $lte: new Date(to) };

    const expenses = await Expense.find(query).sort({ date: -1 });
    return res.status(200).json({ message: 'Znaleziono wydatki', expenses });
  } catch (err) {
    const error = new Error('Błąd pobierania wydatków');
    error.details = err.message;
    next(error);
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Wydatek nie znaleziony' });
    return res.status(200).json({ message: 'Znaleziono wydatek', expense });
  } catch (err) {
    const error = new Error('Błąd pobierania wydatku');
    error.details = err.message;
    next(error);
  }
};

const checkForUnusualExpenses = async (req, res, next) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentExpenses = await Expense.find({
      date: { $gte: yesterday, $lt: today },
    });

    await Promise.all(
      Object.entries(recentExpenses).map(async ([userId, expenses]) => {
        await Promise.all(
          expenses.map(async (expense) => {
            const category = expense.categoryId;

            const similarExpenses = await Expense.find({
              userId,
              categoryId: category,
              date: {
                $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
                $lt: expense.date,
              },
            });

            const avg =
              similarExpenses.reduce((sum, e) => sum + e.amount, 0) / (similarExpenses.length || 1);

            if (expense.amount > avg * 1.5 && expense.amount > 50) {
              await notifyUser({
                userId,
                type: 'expense',
                title: `Nietypowy wydatek w kategorii`,
                message: `Wydałeś ${expense.amount} zł na kategorię ${category}, co przekracza Twoją średnią (${avg.toFixed(2)} zł) o ponad 50%.`,
              });
            }
          })
        );
      })
    );

    return res.status(200).json({ message: 'Sprawdzono nietypowe wydatki.' });
  } catch (err) {
    const error = new Error('Błąd sprawdzania wydatków');
    error.details = err.message;
    next(error);
  }
};

const updateExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const updates = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Nie znaleziono' });
    return res.status(200).json({ message: 'Zaktualizowano pomyślnie.', expense });
  } catch (err) {
    const error = new Error('Błąd aktualizacji wydatku');
    error.details = err.message;
    next(error);
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Nie znaleziono' });
    return res.status(200).json({ message: 'Usunięto wydatek' });
  } catch (err) {
    const error = new Error('Błąd usuwania wydatku');
    error.details = err.message;
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  checkForUnusualExpenses,
  updateExpense,
  deleteExpense,
};
