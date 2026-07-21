export class LogoutCommand {
  async execute(): Promise<void> {
    return;
  }
}

export const logoutCommand = new LogoutCommand();
