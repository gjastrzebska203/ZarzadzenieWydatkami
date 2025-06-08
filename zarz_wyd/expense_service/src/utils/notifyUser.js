const axios = require('axios');

// const notifyUser = async ({ userId, title, message, type = 'budget' }) => {
//   try {
//     await axios.post(
//       `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`,
//       {
//         title,
//         message,
//         type,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${userId}`,
//         },
//       }
//     );
//   } catch (error) {
//     console.error('Błąd powiadomienia:', error);
//   }
// };

const notifyUser = async ({ token, title, message, type = 'budget' }) => {
  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`,
      {
        title,
        message,
        type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Błąd powiadomienia:', error.response?.data || error.message);
  }
};

module.exports = notifyUser;
