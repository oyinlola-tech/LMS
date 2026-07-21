import { redisEnabled } from '..';

export class GetRedisStatusQuery {
  async execute(): Promise<{ enabled: boolean; connected: boolean }> {
    return {
      enabled: redisEnabled,
      connected: redisEnabled,
    };
  }
}
export const getRedisStatusQuery = new GetRedisStatusQuery();
