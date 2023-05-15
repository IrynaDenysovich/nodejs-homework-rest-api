const nodemailer = require("nodemailer");

const sendMail = async (user, auth, host) => {
  const testAccount = await nodemailer.createTestAccount();
  console.log(testAccount);
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: auth,
  });

  return await transporter.sendMail({
    from: "Verification <verification@ethereal.email>",
    to: user.email,
    subject: "Verification Token",
    html: `<p><a href="http://${host}/api/users/verify/${user.verificationToken}">Verify your email address</a></p>`,
  });
};

module.exports = {
  sendMail,
};
