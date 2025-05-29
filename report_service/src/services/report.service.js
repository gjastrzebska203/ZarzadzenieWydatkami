const { Category } = require('../../../category_service/src/models');
const Expense = require('../../../expense_service/src/models/expense.model');

const generateReport = async ({ userId, from, to }) => {
  const expenses = await Expense.find({
    userId,
    date: {
      $gte: new Date(from),
      $lte: new Date(to),
    },
  });

  if (expenses.length === 0) return null;

  const categoryIds = [...new Set(expenses.map((e) => e.categoryId))];

  const categories = await Category.findAll({
    where: { id: categoryIds },
  });

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const totals = expenses.reduce((acc, { categoryId, amount }) => {
    const name = categoryMap[categoryId] || 'Nieznana';
    acc[name] = (acc[name] || 0) + amount;
    return acc;
  }, {});

  const totalsByCategory = Object.entries(totals).map(([category, total]) => ({
    category,
    total,
  }));

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const diffInMs = new Date(to) - new Date(from);
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  let type = '';
  if (diffInDays <= 1) {
    type = 'daily';
  } else if (diffInDays <= 13) {
    type = 'weekly';
  } else if (diffInDays <= 32) {
    type = 'monthly';
  } else {
    type = 'yearly';
  }

  return {
    userId,
    from: new Date(from),
    to: new Date(to),
    type,
    totalsByCategory,
    totalAmount,
  };
};

module.exports = { generateReport };
