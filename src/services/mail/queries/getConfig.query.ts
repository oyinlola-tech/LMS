export class GetMailConfigQuery {
  async execute(): Promise<{ host: string | undefined; port: number; secure: boolean; hasAuth: boolean }> {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
    return {
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : (String(SMTP_SECURE).toLowerCase() === 'true' ? 465 : 587),
      secure: String(SMTP_SECURE).toLowerCase() === 'true',
      hasAuth: Boolean(SMTP_USER && SMTP_PASS),
    };
  }
}
export const getMailConfigQuery = new GetMailConfigQuery();
