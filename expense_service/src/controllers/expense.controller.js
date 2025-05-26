const Expense = require('../models/expense.model');
const { Category } = require('../../../category_service/src/models'); // dostosuj ścieżkę

const createExpense = async (req, res) => {
  try {
    const { amount, categoryId, date, note, tags } = req.body;

    if (categoryId) {
      const category = await Category.findOne({
        where: { id: categoryId, userid: req.user.id },
      });

      if (!category) {
        return res.status(400).json({ message: 'Podana kategoria nie istnieje.' });
      }
    }

    const expense = new Expense({
      userId: req.user.id,
      amount,
      categoryId,
      date,
      note,
      tags: tags ? tags.split(',') : [],
      // attachment: req.file ? req.file.path : null,
    });

    await expense.save();
    return res.status(201).json(expense);
  } catch (err) {
    console.error('Błąd tworzenia wydatku:', err.message);
    return res.status(500).json({ message: 'Nie udało się dodać wydatku' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    if (expenses.length === 0) {
      return res.status(200).json({ message: 'Brak wydatków.' });
    }
    return res.status(200).json(expenses);
  } catch (err) {
    return res.status(500).json({ message: 'Błąd pobierania wydatków' });
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Wydatek nie znaleziony' });
    return res.json(expense);
  } catch (err) {
    return res.status(500).json({ 'Błąd serwera': err.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.categoryId != undefined) {
      const category = await Category.findOne({
        where: { id: updates.categoryId, userid: req.user.id },
      });

      if (!category) {
        return res.status(400).json({ message: 'Podana kategoria nie istnieje.' });
      }
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!expense) return res.status(404).json({ message: 'Nie znaleziono' });

    return res.status(200).json(expense);
  } catch (err) {
    return res.status(500).json({ 'Błąd aktualizacji wydatku': err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Nie znaleziono' });

    return res.json({ message: 'Usunięto wydatek' });
  } catch (err) {
    return res.status(500).json({ message: 'Błąd usuwania wydatku' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
