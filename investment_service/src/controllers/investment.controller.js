const { validationResult } = require('express-validator');
const Investment = require('../models/investment.model');
const { simulateGrowth, yearsBetweenDates } = require('../../utils/simulation.utils.js');

const createInvestment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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
  } catch (error) {
    console.error('Błąd tworzenia celu: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia celu.' });
  }
};

const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });
    return res.status(200).json({ message: 'Znaleziono cele.', investments });
  } catch (error) {
    console.error('Błąd pobierania celów: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania celów.' });
  }
};

const getInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!investment) return res.status(404).json({ message: 'Nie znaleziono celu.' });
    return res.status(200).json({ message: 'Znaleziono cel.', investment });
  } catch (error) {
    console.error('Błąd pobierania celu: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania celu.' });
  }
};

const investmentSimulation = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!investment) return res.status(404).json({ message: 'Nie znaleziono celu' });
    const years = yearsBetweenDates(new Date(), investment.targetDate);
    const futureValue = simulateGrowth(investment.currentAmount, investment.interestRate, years);
    const progress = (investment.currentAmount / investment.targetAmount) * 100;
    return res.status(200).json({
      message: 'Wykonano symulację.',
      investment,
      simulation: { futureValue, progress: Math.min(progress, 100) },
    });
  } catch (error) {
    console.error('Błąd przeprowadzania symulacji: ' + error);
    return res.status(500).json({ message: 'Błąd przeprowadzania symulacji.' });
  }
};

const updateInvestment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, targetAmount, currentAmount, interestRate, targetDate } = req.body;
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!investment) return res.status(404).json({ message: 'Nie znaleziono celu' });
    investment.name = name ?? investment.name;
    investment.targetAmount = targetAmount ?? investment.targetAmount;
    investment.currentAmount = currentAmount ?? investment.currentAmount;
    investment.interestRate = interestRate ?? investment.interestRate;
    investment.targetDate = targetDate ?? investment.targetDate;
    await investment.save();
    return res.status(200).json({ message: 'Zaktualizowano cel', investment });
  } catch (error) {
    console.error('Błąd aktualizacji celu: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji celu.' });
  }
};

const deleteInvestment = async (req, res) => {
  try {
    const deleted = await Investment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Nie znaleziono celu.' });
    return res.status(200).json({ message: 'Usunięto cel inwestycyjny' });
  } catch (error) {
    console.error('Błąd usuwania celu: ' + error);
    return res.status(500).json({ message: 'Błąd usuwania celu.' });
  }
};

module.exports = {
  createInvestment,
  getInvestments,
  getInvestment,
  investmentSimulation,
  updateInvestment,
  deleteInvestment,
};
