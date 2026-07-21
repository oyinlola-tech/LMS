import { ensurePublisher } from '..';
import { logger } from '../../../core/loggers';

export class PublishCommand {
  async execute(channel: string, message: string): Promise<void> {
    const publisher = await ensurePublisher();
    if (!publisher) {
      logger.warn('[Redis] Publish skipped — redis not enabled');
      return;
    }
    await publisher.publish(channel, message);
  }
}
export const publishCommand = new PublishCommand();
