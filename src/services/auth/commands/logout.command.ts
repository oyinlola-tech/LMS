import { addToBlacklist } from '../../../utils/tokenBlacklist.util';

export class LogoutCommand {
  async execute(token?: string): Promise<void> {
    if (!token) return;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf-8'));
      if (payload.exp) {
        addToBlacklist(token, payload.exp);
      }
    } catch {
    }
  }
}

export const logoutCommand = new LogoutCommand();
