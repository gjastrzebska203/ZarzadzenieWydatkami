const Expense = require('../models/expense.model');

const createExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { amount, categoryId, budgetId, date, note, tags } = req.body;
    const expense = new Expense({
      userId: req.user.id,
      amount,
      categoryId,
      budgetId,
      date,
      note,
      tags: tags ? tags.split(',') : [],
    });
    await expense.save();
    return res.status(201).json({ expense });
  } catch (error) {
    console.error('Błąd tworzenia wydatku: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia wydatku.' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    if (expenses.length === 0) {
      return res.status(200).json({ message: 'Brak wydatków.' });
    }
    return res.status(200).json({ expenses });
  } catch (error) {
    console.error('Błąd pobierania wydatków: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania wydatków.' });
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Wydatek nie znaleziony' });
    return res.status(200).json(expense);
  } catch (error) {
    console.error('Błąd pobierania wydatku: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania wydatku.' });
  }
};

const updateExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updates = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Nie znaleziono' });
    return res.status(200).json(expense);
  } catch (error) {
    console.error('Błąd aktualizacji wydatku: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji wydatku.' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Nie znaleziono' });
    return res.status(200).json({ message: 'Usunięto wydatek' });
  } catch (error) {
    console.error('Błąd usuwania wydatku: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania wydatku.' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
