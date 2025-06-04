const Budget = require('../models/budget.model');
const axios = require('axios');
const { validationResult } = require('express-validator');
const notifyUser = require('../utils/notifyUser');

const createBudget = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { limits, period, startDate, endDate } = req.body;
    const diffInMs = endDate - startDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (period === 'weekly') {
      if (diffInDays <= 4 || diffInDays >= 10) {
        const error = new Error('Okres budżetu nie zgadza się z podanymi datami');
        error.status = 400;
        return next(error);
      }
    }
    if (period === 'monthly') {
      if (diffInDays <= 25 || diffInDays >= 35) {
        const error = new Error('Okres budżetu nie zgadza się z podanymi datami');
        error.status = 400;
        return next(error);
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
  } catch (err) {
    const error = new Error('Błąd tworzenia budżetu');
    error.details = err.message;
    next(error);
  }
};

const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.findOne({ userId: req.user.id }).sort({ startDate: -1 });
    return res.status(200).json({ message: 'Znaleziono budżety.', budgets });
  } catch (err) {
    const error = new Error('Błąd pobierania budżetów');
    error.details = err.message;
    next(error);
  }
};

const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) {
      return res.status(400).json({ message: 'Brak budżetu.' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const expenses = await axios.get(
      `${process.env.EXPENSE_SERVICE_URL}/api/expense?budgetId=${budget._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json({ message: 'Znaleziono budżet', budget, expenses: expenses.data });
  } catch (err) {
    const error = new Error('Błąd pobierania budżetu');
    error.details = err.message;
    next(error);
  }
};

const getSavingSuggestions = async (req, res) => {
  try {
    const activeBudgets = await Budget.find({ isActive: true, userId: req.user.id });

    const token = req.headers.authorization?.split(' ')[1];
    await Promise.all(
      activeBudgets.map(async (budget) => {
        try {
          const expenses_req = await axios.get(
            `${process.env.EXPENSE_SERVICE_URL}/api/expense?budgetId=${budget._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const expenses = expenses_req.data.expenses || [];

          const totals = expenses.reduce((acc, { categoryId, amount }) => {
            acc[categoryId] = (acc[categoryId] || 0) + amount;
            return acc;
          }, {});

          await Promise.all(
            budget.limits.map(async (limit) => {
              const spent = totals[limit.category] || 0;
              const ratio = spent / limit.amount;

              if (ratio >= 0.7) {
                const percentLeft = Math.round((1 - ratio) * 100);

                await notifyUser({
                  token,
                  type: 'suggestion',
                  title: `Sugerujemy oszczędności w kategorii ${limit.category}`,
                  message: `Wykorzystałeś już ${Math.round(ratio * 100)}% budżetu na "${limit.category}". Zostało tylko ${percentLeft}% do końca okresu. Spróbuj ograniczyć wydatki!`,
                });
              }
            })
          );
        } catch (err) {
          console.error(`Błąd obsługi budżetu ${budget._id}:`, err.message);
        }
      })
    );

    return res.status(200).json({ message: 'Wysłano powiadomienie o oszczędnościach.' });
  } catch (err) {
    const error = new Error('Błąd sugestii oszczędzania');
    error.details = err.message;
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) {
      const error = new Error('Budżet nie znaleziony.');
      error.status = 400;
      return next(error);
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
  } catch (err) {
    const error = new Error('Błąd aktualizacji budżetu');
    error.details = err.message;
    next(error);
  }
};

const checkBudgetLimits = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) {
      const error = new Error('Nie znaleziono budżetu.');
      error.status = 400;
      return next(error);
    }

    const token = req.headers.authorization?.split(' ')[1];
    const expenses_req = await axios.get(
      `${process.env.EXPENSE_SERVICE_URL}/api/expense?budgetId=${budget._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const expenses = expenses_req.data.expenses;
    if (expenses.length === 0) {
      const error = new Error('Brak wydatków.');
      error.status = 400;
      return next(error);
    }

    const totals = expenses.reduce((acc, { categoryId, amount }) => {
      acc[categoryId] = (acc[categoryId] || 0) + amount;
      return acc;
    }, {});

    const totalsByCategory = Object.entries(totals).map(([category, total]) => ({
      category,
      total,
    }));

    let overLimit = false;
    await Promise.all(
      totalsByCategory.map(async (curr) => {
        const limit = budget.limits.find((el) => el.category === curr.category);
        if (limit && curr.total > limit.amount) {
          overLimit = true;
          await notifyUser({
            token: req.headers.authorization?.split(' ')[1],
            title: 'Przekroczono limit budżetu',
            message: `Przekroczono limit kategorii "${curr.category}" w budżecie nr ${budget._id}`,
          });
        }
      })
    );

    if (overLimit === true) {
      return res.status(200).json({ message: 'Przekroczono limit, wysłano powiadomienie.' });
    } else if (overLimit === false) {
      return res.status(200).json({ message: 'Nie przekroczono limitu.' });
    }
  } catch (err) {
    const error = new Error('Błąd sprawdzania czy budżet przekroczył limit.');
    error.details = err.message;
    next(error);
  }
};

const addLimit = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const budget = await Budget.findOne({
      where: { _id: req.params.id, userId: req.user.id },
    });
    if (!budget) {
      const error = new Error('Nie znaleziono budżetu.');
      error.status = 400;
      return next(error);
    }
    const { limits } = req.body;
    budget.limits.push(...limits);
    await budget.save();
    return res.status(200).json({ message: 'Dodano limit pomyślnie.', budget });
  } catch (err) {
    const error = new Error('Błąd dodawania limitów do budżetu');
    error.details = err.message;
    next(error);
  }
};

const deleteLimit = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) {
      const error = new Error('Nie znaleziono budżetu.');
      error.status = 400;
      return next(error);
    }
    budget.limits = budget.limits.filter((x) => x.category !== req.params.category);
    await budget.save();
    return res.status(200).json({ message: 'Usunieto limit pomyślnie.', budget });
  } catch (err) {
    const error = new Error('Błąd usuwania limitu');
    error.details = err.message;
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      where: { _id: req.params.id, userId: req.user.id },
    });
    if (!budget) {
      const error = new Error('Nie znaleziono budżetu.');
      error.status = 400;
      return next(error);
    }
    await budget.deleteOne();
    return res.status(200).json({ message: 'Budżet usunięty' });
  } catch (err) {
    const error = new Error('Błąd usuwania budżetu');
    error.details = err.message;
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudget,
  getSavingSuggestions,
  updateBudget,
  addLimit,
  checkBudgetLimits,
  deleteLimit,
  deleteBudget,
};
