const cron = require('node-cron');
const RecurringPayment = require('../models/recurring.model');
const axios = require('axios');

// Co noc o 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('CRON: Auto-księgowanie cyklicznych płatności');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const payments = await RecurringPayment.find({
    nextPaymentDate: { $lte: today },
    isActive: true,
    autoExecute: true,
  });

  for (const p of payments) {
    try {
      // Tworzenie wydatku przez expenses-service
      await axios.post(
        `${process.env.EXPENSE_SERVICE_URL}/api/expenses`,
        {
          amount: p.amount,
          categoryId: p.categoryId,
          note: `[AUTO] ${p.name}`,
          date: today,
        },
        {
          headers: {
            Authorization: `Bearer ${p.userId}`,
          },
        }
      );

      // Zaktualizuj daty
      const nextDate = calculateNextDate(p.frequency, p);
      await RecurringPayment.findByIdAndUpdate(p._id, {
        lastPaymentDate: today,
        nextPaymentDate: nextDate,
      });

      console.log(`Zakup automatyczny dodany dla: ${p.name}`);
    } catch (err) {
      console.error(`Błąd księgowania dla: ${p.name}`, err.message);
    }
  }
});

function calculateNextDate(freq, p) {
  const base = new Date();
  switch (freq) {
    case 'daily':
      base.setDate(base.getDate() + 1);
      break;
    case 'weekly':
      base.setDate(base.getDate() + 7);
      break;
    case 'monthly':
      base.setMonth(base.getMonth() + 1);
      base.setDate(p.dayOfMonth || 1);
      break;
  }
  return base;
}
