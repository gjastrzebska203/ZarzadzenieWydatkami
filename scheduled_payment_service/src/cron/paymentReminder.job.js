const cron = require('node-cron');
const RecurringPayment = require('../models/recurring.model');
const notifyUser = require('../utils/notifyUser');

// Codziennie o 08:00
cron.schedule('0 8 * * *', async () => {
  console.log('CRON: Wysyłanie przypomnień o nadchodzących płatnościach');

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const payments = await RecurringPayment.find({
    isActive: true,
    remindBeforeDays: { $gt: 0 },
  });

  for (const p of payments) {
    const reminderDate = new Date(p.nextPaymentDate);
    reminderDate.setDate(reminderDate.getDate() - p.remindBeforeDays);

    if (reminderDate.getTime() === now.getTime()) {
      await notifyUser({
        userId: p.userId,
        title: `Zbliża się płatność: ${p.name}`,
        message: `Już za ${p.remindBeforeDays} dni zostanie pobrana płatność cykliczna: ${p.amount} zł.`,
      });
    }
  }
});
