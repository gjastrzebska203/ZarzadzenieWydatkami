const express = require('express');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware.js');
const {
  createInvestment,
  getInvestments,
  getInvestment,
  getInvestmentSummary,
  getAllInvestments,
  investmentSimulation,
  updateInvestment,
  deleteInvestment,
} = require('../controllers/investment.controller.js');
const {
  validateCreateInvestment,
  validateUpdateInvestment,
} = require('../middlewares/validate.middleware.js');

const router = express.Router();

router.post('/', authenticate, validateCreateInvestment, createInvestment);
router.get('/', authenticate, getInvestments);
router.get('/all/investments', authenticate, authorizeRole('admin'), getAllInvestments);
router.get('/:id', authenticate, getInvestment);
router.get('/get/summary', authenticate, getInvestmentSummary);
router.get('/:id/simulate', authenticate, investmentSimulation);
router.put('/:id', authenticate, validateUpdateInvestment, updateInvestment);
router.delete('/:id', authenticate, deleteInvestment);
router.get('/get/crash', (req, res, next) => {
  throw new Error('Symulowany crash aplikacji');
});

module.exports = router;
