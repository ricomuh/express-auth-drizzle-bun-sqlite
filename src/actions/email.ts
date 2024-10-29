import nodemailer from "nodemailer";
import { MailSlurp } from "mailslurp-client";

const mailslurp = new MailSlurp({
  apiKey: process.env.MAILSLURP_API_KEY || "",
});
const { smtpServerHost, smtpServerPort, smtpUsername, smtpPassword } =
  await mailslurp.getImapSmtpAccessDetails();

const transporter = nodemailer.createTransport({
  host: smtpServerHost,
  port: smtpServerPort,
  secure: false,
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  });
}
