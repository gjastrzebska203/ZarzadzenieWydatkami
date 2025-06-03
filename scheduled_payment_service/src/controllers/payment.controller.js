const { validationResult } = require('express-validator');
const Payment = require('../models/payment.model');
const mongoose = require('mongoose');

const createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      amount,
      categoryId,
      budgetId,
      frequency,
      dayOfMonth,
      dayOfWeek,
      nextPaymentDate,
      lastPaymentDate,
      remindBeforeDays,
      autoExecute,
      isActive,
    } = req.body;

    if ((frequency === 'weekly' && !dayOfWeek) || (frequency === 'monthly' && !dayOfMonth)) {
      return res.status(400).json({ message: 'Podaj dane częstotliwości płatności.' });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      name,
      amount,
      categoryId,
      budgetId,
      frequency,
      dayOfMonth,
      dayOfWeek,
      nextPaymentDate,
      lastPaymentDate,
      remindBeforeDays,
      autoExecute,
      isActive,
    });
    res.status(201).json({ message: 'Utworzono płatność cykliczną.', payment });
  } catch (error) {
    console.error('Błąd tworzenia płatności cyklicznej: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia płatności cyklicznej.' });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id });
    res.status(200).json({ message: 'Znaleziono płatności cykliczne.', payments });
  } catch (error) {
    console.error('Błąd pobierania płatności cyklicznych: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania płatności cyklicznych.' });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!payment) return res.status(404).json({ message: 'Nie znaleziono' });
    res.status(200).json({ message: 'Znaleziono płatność.', payment });
  } catch (error) {
    console.error('Błąd pobierania płatności cyklicznej: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania płatności cyklicznej.' });
  }
};

const updatePayment = async (req, res) => {
  try {
    const {
      name,
      amount,
      categoryId,
      budgetId,
      frequency,
      dayOfMonth,
      dayOfWeek,
      nextPaymentDate,
      lastPaymentDate,
      remindBeforeDays,
      autoExecute,
      isActive,
    } = req.body;

    const payment = await Payment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!payment) return res.status(404).json({ message: 'Nie znaleziono' });

    payment.name = name ?? payment.name;
    payment.amount = amount ?? payment.amount;
    payment.categoryId = categoryId ?? payment.categoryId;
    payment.budgetId = budgetId ?? payment.budgetId;
    payment.frequency = frequency ?? payment.frequency;
    payment.dayOfMonth = dayOfMonth ?? payment.dayOfMonth;
    payment.dayOfWeek = dayOfWeek ?? payment.dayOfWeek;
    payment.nextPaymentDate = nextPaymentDate ?? payment.nextPaymentDate;
    payment.lastPaymentDate = lastPaymentDate ?? payment.lastPaymentDate;
    payment.remindBeforeDays = remindBeforeDays ?? payment.remindBeforeDays;
    payment.autoExecute = autoExecute ?? payment.autoExecute;
    payment.isActive = isActive ?? payment.isActive;
    await payment.save();
    res.status(200).json({ message: 'Zaktualizowano płatność.', updated });
  } catch (error) {
    console.error('Błąd aktualizacji płatności cyklicznej: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji płatności cyklicznej.' });
  }
};

const deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: 'Nie znaleziono' });
    res.status(200).json({ message: 'Płatność cykliczna usunięta' });
  } catch (error) {
    console.error('Błąd usunięcia płatności cyklicznej: ' + error);
    return res.status(500).json({ message: 'Błąd usunięcia płatności cyklicznej.' });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
