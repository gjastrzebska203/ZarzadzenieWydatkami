const express = require('express');
const {
  createNotification,
  getNotifications,
  getNotificationById,
  getAllNotifications,
  getUnreadCount,
  updateNotification,
  deleteNotification,
} = require('../controllers/notifications.controller');
const {
  validateCreateNotification,
  validateUpdateNotification,
} = require('../middlewares/validate.middleware');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();
// router.use(authenticate);

router.post('/', authenticate, validateCreateNotification, createNotification);
router.get('/', authenticate, getNotifications);
router.get('/all/notifications', authenticate, authorizeRole('admin'), getAllNotifications);
router.get('/:id', authenticate, getNotificationById);
router.get('/unread/count', authenticate, getUnreadCount);
router.put('/:id', authenticate, validateUpdateNotification, updateNotification);
router.delete('/:id', authenticate, deleteNotification);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});

module.exports = router;
