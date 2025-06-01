const { validationResult } = require('express-validator');
const Notification = require('../models/notifications.model');

const createNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, title, message } = req.body;
    const notification = await Notification.create({
      userId: req.user.id,
      type,
      title,
      message,
    });
    res.status(201).json({ message: 'Utworzono powiadomienie.', notification });
  } catch (error) {
    console.error('Błąd tworzenia powiadomienia: ' + error);
    return res.status(500).json({ message: 'Błąd tworzenia powiadomienia.' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Znaleziono powiadomienia.', notifications });
  } catch (error) {
    console.error('Błąd pobierania powiadomień: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania powiadomień.' });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
    res.status(200).json({ message: 'Znaleziono powiadomienie', notification });
  } catch (error) {
    console.error('Błąd pobierania powiadomienia: ' + error);
    return res.status(500).json({ message: 'Błąd pobierania powiadomienia.' });
  }
};

const updateNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
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
  } catch (error) {
    console.error('Błąd aktualizacji powiadomienia: ' + error);
    return res.status(500).json({ message: 'Błąd aktualizacji powiadomienia.' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: 'Nie znaleziono powiadomienia' });
    return res.status(200).json({ message: 'Usunięto powiadomienie' });
  } catch (error) {
    console.error('Błąd usunięcia powiadomienia: ' + error);
    return res.status(500).json({ message: 'Błąd usunięcia powiadomienia.' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
