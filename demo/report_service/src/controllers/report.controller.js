const { validationResult } = require('express-validator');
const Report = require('../models/report.model');

const createReport = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { from, to } = req.body;

    const token = authHeader.split(' ')[1];

    const expenses_req = await axios.get(
      `${process.env.EXPENSE_SERVICE_URL}/api/expense?from=${from}&to=${to}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const expenses = expenses_req.data.expenses;

    if (expenses.length === 0) {
      const error = new Error('Brak wydatków');
      error.details = err.message;
      next(error);
    }

    const categoryIds = [...new Set(expenses.map((e) => e.categoryId))];

    const categories = await Category.findAll({
      where: { id: categoryIds },
    });

    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    const totals = expenses.reduce((acc, { categoryId, amount }) => {
      const name = categoryMap[categoryId] || 'Nieznana';
      acc[name] = (acc[name] || 0) + amount;
      return acc;
    }, {});

    const totalsByCategory = Object.entries(totals).map(([category, total]) => ({
      category,
      total,
    }));

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    const diffInMs = new Date(to) - new Date(from);
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    let type = '';
    if (diffInDays <= 1) {
      type = 'daily';
    } else if (diffInDays <= 13) {
      type = 'weekly';
    } else if (diffInDays <= 32) {
      type = 'monthly';
    } else {
      type = 'yearly';
    }

    const report_data = {
      userId,
      from: new Date(from),
      to: new Date(to),
      type,
      totalsByCategory,
      totalAmount,
    };

    const report = await Report.create(report_data);

    res.status(201).json({ message: 'Utworzono raport', report });
  } catch (err) {
    const error = new Error('Błąd tworzenia raportu');
    error.details = err.message;
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Znaleziono raporty', reports });
  } catch (err) {
    const error = new Error('Błąd pobierania raportów');
    error.details = err.message;
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: 'Nie znaleziono raportu' });
    return res.status(200).json({ message: 'Znaleziono', report });
  } catch (err) {
    const error = new Error('Błąd pobierania raportu');
    error.details = err.message;
    next(error);
  }
};

const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Znaleziono raporty', reports });
  } catch (err) {
    const error = new Error('Błąd pobierania raportów');
    error.details = err.message;
    next(error);
  }
};

const getYearlyReportSummary = async (req, res, next) => {
  try {
    const summary = await Report.aggregate([
      { $match: { userId: req.user.id, type: 'yearly' } },
      {
        $group: {
          _id: { year: { $year: '$from' } },
          totalSpent: { $sum: '$totalAmount' },
          reports: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1 } },
    ]);
    res.status(200).json({ message: 'Zestawienie roczne', summary });
  } catch (err) {
    const error = new Error('Błąd agregacji raportów');
    error.details = err.message;
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const result = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ message: 'Nie znaleziono raportu' });
    return res.status(200).json({ message: 'Raport usunięty' });
  } catch (err) {
    const error = new Error('Błąd usuwania raportu');
    error.details = err.message;
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  getAllReports,
  getYearlyReportSummary,
  deleteReport,
};
