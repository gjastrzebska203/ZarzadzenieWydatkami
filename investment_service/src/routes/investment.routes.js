const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createInvestment,
  getInvestments,
  getInvestment,
  getInvestmentSummary,
  investmentSimulation,
  updateInvestment,
  deleteInvestment,
} = require('../controllers/investment.controller');
const {
  validateCreateInvestment,
  validateUpdateInvestment,
} = require('../middlewares/validate.middleware.js');

const router = express.Router();
router.use(authenticate);

router.post('/', validateCreateInvestment, createInvestment);
router.get('/', getInvestments);
router.get('/:id', getInvestment);
router.get('/get/summary', getInvestmentSummary);
router.get('/:id/simulate', investmentSimulation);
router.put('/:id', validateUpdateInvestment, updateInvestment);
router.delete('/:id', deleteInvestment);

module.exports = router;
