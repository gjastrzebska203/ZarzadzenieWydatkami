const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createReport,
  getReports,
  getReportById,
  getYearlyReportSummary,
  deleteReport,
} = require('../controllers/report.controller');
const { validateCreateReport } = require('../middlewares/validate.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/', validateCreateReport, createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.get('/yearly/summary', getYearlyReportSummary);
router.delete('/:id', deleteReport);

module.exports = router;
