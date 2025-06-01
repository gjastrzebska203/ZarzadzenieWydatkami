const express = require('express');
const {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} = require('../controllers/notifications.controller');
const {
  validateCreateNotification,
  validateUpdateNotification,
} = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/', validateCreateNotification, createNotification);
router.get('/', getNotifications);
router.get('/:id', getNotificationById);
router.put('/:id', validateUpdateNotification, updateNotification);
router.delete('/:id', deleteNotification);

module.exports = router;
