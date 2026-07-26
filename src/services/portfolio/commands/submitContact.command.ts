import { Portfolio, PortfolioContact, User } from '../../../models';
import { sendEmail } from '../../mail';

export interface ContactInput {
  slug: string;
  name: string;
  email: string;
  message: string;
}

export class SubmitContactCommand {
  async execute(input: ContactInput): Promise<PortfolioContact> {
    const portfolio = await Portfolio.findOne({ where: { slug: input.slug, isPublic: true }, include: [{ model: User }] });
    if (!portfolio) { const err: any = new Error('Portfolio not found'); err.code = 'NOT_FOUND'; err.statusCode = 404; throw err; }

    const contact = await PortfolioContact.create({
      PortfolioId: portfolio.id,
      name: input.name,
      email: input.email,
      message: input.message,
    });

    const owner = (portfolio as any).User;
    const msgHtml = `<p><strong>Name:</strong> ${input.name}</p><p><strong>Email:</strong> ${input.email}</p><p><strong>Message:</strong></p><p>${input.message}</p>`;
    const msgText = `Name: ${input.name}\nEmail: ${input.email}\nMessage: ${input.message}`;

    if (owner?.email) {
      sendEmail({
        to: owner.email,
        subject: `New portfolio contact from ${input.name}`,
        html: msgHtml,
        text: msgText,
      }).catch(() => {});
    }

    sendEmail({
      to: input.email,
      subject: `Copy of your message to ${owner?.fullName || 'portfolio owner'}`,
      html: `<p>Hi ${input.name},</p><p>Here is a copy of your message sent via LearnBridge Portfolio:</p>${msgHtml}<hr/><p style="font-size:0.8125rem;color:#6b7280">Sent via <a href="https://learnbridge.com">LearnBridge</a> Portfolio</p>`,
      text: `Hi ${input.name},\n\nHere is a copy of your message:\n\n${msgText}\n\n---\nSent via LearnBridge Portfolio`,
    }).catch(() => {});

    return contact;
  }
}
export const submitContactCommand = new SubmitContactCommand();
