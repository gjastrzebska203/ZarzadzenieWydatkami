const { validationResult } = require('express-validator');
const Investment = require('../models/investment.model.js');
const { simulateGrowth, yearsBetweenDates } = require('../utils/simulation.utils.js');

const createInvestment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { name, targetAmount, currentAmount, interestRate, targetDate } = req.body;
    const investment = await Investment.create({
      userId: req.user.id,
      name,
      targetAmount,
      currentAmount,
      interestRate,
      targetDate,
    });
    return res.status(201).json({ message: 'Utworzono cel.', investment });
  } catch (err) {
    const error = new Error('Błąd tworzenia celu');
    error.details = err.message;
    return next(error);
  }
};

const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });
    return res.status(200).json({ message: 'Znaleziono cele.', investments });
  } catch (err) {
    const error = new Error('Błąd pobierania celów');
    error.details = err.message;
    return next(error);
  }
};

const getAllInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find();
    return res.status(200).json({ message: 'Znaleziono cele.', investments });
  } catch (err) {
    console.error(err);
    const error = new Error('Błąd pobierania celów');
    error.details = err.message;
    return next(error);
  }
};

const getInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!investment) return res.status(404).json({ message: 'Nie znaleziono celu.' });
    return res.status(200).json({ message: 'Znaleziono cel.', investment });
  } catch (err) {
    const error = new Error('Błąd pobierania celu');
    error.details = err.message;
    return next(error);
  }
};

const getInvestmentSummary = async (req, res, next) => {
  try {
    const result = await Investment.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalTarget: { $sum: '$targetAmount' },
          totalCurrent: { $sum: '$currentAmount' },
          soonestTargetDate: { $min: '$targetDate' },
        },
      },
      {
        $project: {
          _id: 0,
          totalTarget: 1,
          totalCurrent: 1,
          soonestTargetDate: 1,
          progress: {
            $cond: [
              { $eq: ['$totalTarget', 0] },
              0,
              { $divide: ['$totalCurrent', '$totalTarget'] },
            ],
          },
        },
      },
    ]);

    const summary = result[0] || {
      totalTarget: 0,
      totalCurrent: 0,
      progress: 0,
      soonestTargetDate: null,
    };

    return res.status(200).json({ message: 'Podsumowanie inwestycji', summary });
  } catch (err) {
    const error = new Error('Błąd agregacji inwestycji');
    error.details = err.message;
    return next(error);
  }
};

const investmentSimulation = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!investment) return res.status(404).json({ message: 'Nie znaleziono celu' });
    const years = yearsBetweenDates(new Date(), investment.targetDate);
    const futureValue = simulateGrowth(investment.currentAmount, investment.interestRate, years);
    const progress = (investment.currentAmount / investment.targetAmount) * 100;
    return res.status(200).json({
      message: 'Wykonano symulację.',
      investment,
      simulation: { futureValue, progress: Math.min(progress, 100) },
    });
  } catch (err) {
    const error = new Error('Błąd przeprowadzania symulacji');
    error.details = err.message;
    return next(error);
  }
};

const updateInvestment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { name, targetAmount, currentAmount, interestRate, targetDate } = req.body;
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!investment) return res.status(404).json({ message: 'Nie znaleziono celu' });
    investment.name = name ?? investment.name;
    investment.targetAmount = targetAmount ?? investment.targetAmount;
    investment.currentAmount = currentAmount ?? investment.currentAmount;
    investment.interestRate = interestRate ?? investment.interestRate;
    investment.targetDate = targetDate ?? investment.targetDate;
    await investment.save();
    return res.status(200).json({ message: 'Zaktualizowano cel', investment });
  } catch (err) {
    const error = new Error('Błąd aktualizacji celu');
    error.details = err.message;
    next(error);
  }
};

const deleteInvestment = async (req, res, next) => {
  try {
    const deleted = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: 'Nie znaleziono celu.' });
    return res.status(200).json({ message: 'Usunięto cel inwestycyjny' });
  } catch (err) {
    const error = new Error('Błąd usuwania celu');
    error.details = err.message;
    return next(error);
  }
};

module.exports = {
  createInvestment,
  getInvestments,
  getInvestment,
  getAllInvestments,
  getInvestmentSummary,
  investmentSimulation,
  updateInvestment,
  deleteInvestment,
};
