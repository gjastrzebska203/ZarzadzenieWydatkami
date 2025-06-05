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
router.use(authenticate);

router.post('/', validateCreateNotification, createNotification);
router.get('/', getNotifications);
router.get('/all/notifications', authorizeRole, getAllNotifications);
router.get('/:id', getNotificationById);
router.get('/unread/count', getUnreadCount);
router.put('/:id', validateUpdateNotification, updateNotification);
router.delete('/:id', deleteNotification);

module.exports = router;
