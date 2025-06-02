const cron = require('node-cron');
const Budget = require('../models/budget.model');
const Expense = require('../../../expense_service/src/models/expense.model');
const notifyUser = require('../utils/notifyUser');
const { startOfWeek, endOfWeek } = require('date-fns');

cron.schedule('0 12 * * *', async () => {
  console.log('Cron: Generowanie sugestii oszczędnościowych');

  const activeBudgets = await Budget.find({ isActive: true });

  for (const budget of activeBudgets) {
    const userId = budget.userId;
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const expenses = await Expense.find({
      userId,
      date: { $gte: thisWeekStart, $lte: thisWeekEnd },
    });

    const totals = expenses
      .map((exp) => ({ categoryId: exp.categoryId, amount: exp.amount }))
      .reduce((acc, { categoryId, amount }) => {
        acc[categoryId] = (acc[categoryId] || 0) + amount;
        return acc;
      }, {});

    for (const limit of budget.limits) {
      const spent = totals[limit.category] || 0;
      const ratio = spent / limit.amount;

      if (ratio >= 0.7 && ratio < 1.0) {
        const percentLeft = Math.round((1 - ratio) * 100);

        await notifyUser({
          token: req.headers.authorization?.split(' ')[1],
          type: 'suggestion',
          title: `Sugerujemy oszczędności w kategorii ${limit.category}`,
          message: `Wykorzystałeś już ${Math.round(ratio * 100)}% budżetu na "${limit.category}". Zostało tylko ${percentLeft}% do końca okresu. Spróbuj ograniczyć wydatki!`,
        });
      }
    }
  }
});
