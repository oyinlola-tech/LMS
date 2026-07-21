import { sendEmail, sendEmailNow } from '..';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class SendEmailCommand {
  async execute(input: SendEmailInput): Promise<void> {
    await sendEmail(input);
  }
}
export const sendEmailCommand = new SendEmailCommand();

export class SendEmailNowCommand {
  async execute(input: SendEmailInput): Promise<void> {
    await sendEmailNow(input);
  }
}
export const sendEmailNowCommand = new SendEmailNowCommand();
