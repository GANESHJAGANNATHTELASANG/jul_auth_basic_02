import { createTransport } from "nodemailer";

const sendMail = async ({ email, subject, html }) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    post: 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log(process.env.SMTP_USER);
  console.log(process.env.SMTP_PASSWORD);

  await transport.sendMail({
    from: "",
    to: email,
    subject,
    html,
  });
};

export default sendMail;
