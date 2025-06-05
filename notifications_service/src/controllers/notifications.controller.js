const { validationResult } = require('express-validator');
const Notification = require('../models/notifications.model');

const createNotification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { userId, type, title, message } = req.body;
    const notification = await Notification.create({
      userId: userId || req.user.id,
      type,
      title,
      message,
    });
    res.status(201).json({ message: 'Utworzono powiadomienie.', notification });
  } catch (err) {
    const error = new Error('Błąd tworzenia powiadomienie');
    error.details = err.message;
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Znaleziono powiadomienia.', notifications });
  } catch (err) {
    const error = new Error('Błąd pobierania powiadomień');
    error.details = err.message;
    next(error);
  }
};

const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Znaleziono powiadomienia.', notifications });
  } catch (err) {
    const error = new Error('Błąd pobierania powiadomień');
    error.details = err.message;
    next(error);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
    res.status(200).json({ message: 'Znaleziono powiadomienie', notification });
  } catch (err) {
    const error = new Error('Błąd pobierania powiadomienia');
    error.details = err.message;
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await Notification.aggregate([
      { $match: { userId: req.user.id, isRead: false } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const count = result[0]?.count || 0;
    res.status(200).json({ message: 'Liczba nieprzeczytanych powiadomień', count });
  } catch (err) {
    const error = new Error('Błąd agregacji');
    error.details = err.message;
    next(error);
  }
};

const updateNotification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Błąd walidacji');
    error.status = 400;
    error.details = errors.array();
    return next(error);
  }

  try {
    const { type, title, message, isRead } = req.body;
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
    notification.type = type ?? notification.type;
    notification.title = title ?? notification.title;
    notification.message = message ?? notification.message;
    notification.isRead = isRead ?? notification.isRead;
    await notification.save();
    return res.status(200).json({ message: 'Zaktualizowano powiadomienie.', notification });
  } catch (err) {
    const error = new Error('Błąd aktualizacji powiadomienia');
    error.details = err.message;
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
    return res.status(200).json({ message: 'Usunięto powiadomienie' });
  } catch (err) {
    const error = new Error('Błąd usuwania powiadomienia');
    error.details = err.message;
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  getAllNotifications,
  getUnreadCount,
  updateNotification,
  deleteNotification,
};
