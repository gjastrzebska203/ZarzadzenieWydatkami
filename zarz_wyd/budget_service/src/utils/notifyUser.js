const axios = require("axios");

const notifyUser = async ({ token, title, message, type = "budget" }) => {
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
      },
    );
  } catch (err) {
    const error = new Error("Błąd wysyłania powiadomienia");
    error.details = err.message;
    next(error);
  }
};

module.exports = notifyUser;
