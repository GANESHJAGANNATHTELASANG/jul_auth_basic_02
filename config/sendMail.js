import { createTransport } from "nodemailer";

const sendMail = async ({ email, subject, html }) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    post: 465,
    auth: {
      user: "",
      pass: "",
    },
  });
  await transport.sendMail({
    from: "",
    to: email,
    subject,
    html,
  });
};

export default sendMail;
