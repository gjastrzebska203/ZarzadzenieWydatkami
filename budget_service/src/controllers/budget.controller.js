const Budget = require('../models/budget.model');
const { validationResult } = require('express-validator');

const createBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { limits, period, startDate, endDate } = req.body;
    const diffInMs = endDate - startDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (period === 'weekly') {
      if (diffInDays <= 4 || diffInDays >= 10) {
        return res.status(400).json({ message: 'Okres budżetu nie zgadza się z podanymi datami.' });
      }
    }
    if (period === 'monthly') {
      if (diffInDays <= 25 || diffInDays >= 35) {
        return res.status(400).json({ message: 'Okres budżetu nie zgadza się z podanymi datami.' });
      }
    }
    const today = new Date();
    isActive = false;
    if (startDate <= today && endDate >= today) {
      isActive = true;
    }
    const budget = await Budget.create({
      userId: req.user.id,
      limits,
      period,
      startDate,
      endDate,
    });
    return res.status(201).json({ message: 'Utworzono budżet.', budget });
  } catch (error) {
    console.error('Błąd tworzenia budżetu: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia budżetu.' });
  }
};

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findOne({ userId: req.user.id }).sort({ startDate: -1 });
    if (budgets.length === 0) {
      return res.status(200).json({ message: 'Brak budżetów.' });
    }
    return res.status(200).json({ budgets });
  } catch (error) {
    console.error('Błąd pobierania budżetów: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania budżetów.' });
  }
};

const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) {
      return res.status(400).json({ message: 'Brak budżetu.' });
    }
    return res.status(200).json({ budget });
  } catch (error) {
    console.error('Błąd pobierania budżetu: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania budżetu.' });
  }
};

const updateBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) {
      return res.status(404).json({ message: 'Budżet nie znaleziony.' });
    }
    const { limits, period, startDate, endDate } = req.body;
    budget.limits = limits ?? budget.limits;
    budget.period = period ?? budget.period;
    budget.startDate = startDate ?? budget.startDate;
    budget.endDate = endDate ?? budget.endDate;
    const today = new Date();
    let active = false;
    if (budget.startDate <= today && budget.endDate >= today) {
      active = true;
    }
    budget.isActive = active;
    await budget.save();
    return res.status(200).json({ message: 'Zaktualizowano pomyślnie.', budget });
  } catch (error) {
    console.error('Błąd aktualizacji budżetu: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji budżetu.' });
  }
};

const addLimit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const budget = await Budget.findOne({
      where: { _id: req.params.id, userId: req.user.id },
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budżet nie znaleziony.' });
    }
    const { limits } = req.body;
    budget.limits.push(...limits);
    await budget.save();
    return res.status(200).json({ message: 'Dodano limit pomyślnie.', budget });
  } catch (error) {
    console.error('Błąd aktualizacji budżetu: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji budżetu.' });
  }
};

const deleteLimit = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) {
      return res.status(404).json({ message: 'Budżet nie znaleziony.' });
    }
    budget.limits = budget.limits.filter((x) => x.category !== req.params.category);
    await budget.save();
    return res.status(200).json({ message: 'Usunieto limit pomyślnie.', budget });
  } catch (error) {
    console.error('Błąd aktualizacji budżetu: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania limitu.' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: { _id: req.params.id, userId: req.user.id },
    });
    if (!budget) {
      return res.status(404).json({ message: 'Budżet nie znaleziony' });
    }
    await budget.deleteOne();
    return res.status(200).json({ message: 'Budżet usunięty' });
  } catch (error) {
    console.error('Błąd usuwania budżetu: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania budżetu.' });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  addLimit,
  deleteLimit,
  deleteBudget,
};
