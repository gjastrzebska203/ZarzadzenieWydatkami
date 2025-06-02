const cron = require('node-cron');
const Expense = require('../models/expense.model');
const notifyUser = require('../utils/notifyUser');

// Cron codziennie o 12:05
cron.schedule('5 12 * * *', async () => {
  console.log('Cron: Wyszukiwanie nietypowych wydatków');

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const recentExpenses = await Expense.find({
    date: { $gte: yesterday, $lt: today },
  });

  const groupedByUser = {};

  for (const exp of recentExpenses) {
    if (!groupedByUser[exp.userId]) groupedByUser[exp.userId] = [];
    groupedByUser[exp.userId].push(exp);
  }

  for (const [userId, expenses] of Object.entries(groupedByUser)) {
    for (const expense of expenses) {
      const category = expense.categoryId;

      const similarExpenses = await Expense.find({
        userId,
        categoryId: category,
        date: {
          $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          $lt: expense.date,
        },
      });

      const avg =
        similarExpenses.reduce((sum, e) => sum + e.amount, 0) / (similarExpenses.length || 1);

      if (expense.amount > avg * 1.5 && expense.amount > 50) {
        await notifyUser({
          userId,
          type: 'expense',
          title: `Nietypowy wydatek w kategorii`,
          message: `Wydałeś ${expense.amount} zł na kategorię ${category}, co przekracza Twoją średnią (${avg.toFixed(
            2
          )} zł) o ponad 50%.`,
        });
      }
    }
  }
});
