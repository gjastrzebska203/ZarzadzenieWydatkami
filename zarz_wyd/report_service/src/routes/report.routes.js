const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');
const {
  createReport,
  getReports,
  getReportById,
  getAllReports,
  getYearlyReportSummary,
  deleteReport,
} = require('../controllers/report.controller');
const { validateCreateReport } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/', validateCreateReport, authenticate, createReport);
router.get('/', authenticate, getReports);
router.get('/all/reports', authorizeRole('admin'), getAllReports);
router.get('/:id', authenticate, getReportById);
router.get('/summary/yearly', authenticate, getYearlyReportSummary);
router.delete('/:id', authenticate, deleteReport);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});
module.exports = router;
