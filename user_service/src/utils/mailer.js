const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendResetEmail = async (to, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: `"Finance App" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Resetowanie hasła',
    html: `
      <h3>Resetowanie hasła</h3>
      <p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link wygaśnie za 1 godzinę.</p>
    `,
  });
  console.log(`Mail podgląd: ${nodemailer.getTestMessageUrl(info)}`);
};

module.exports = { sendResetEmail };
