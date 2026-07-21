import { userInterestRepository } from '../../../repositories/userInterest.repository';

export class UpdateInterestsCommand {
  async execute(params: {
    userId: string;
    interests: string[];
  }): Promise<string[]> {
    const clean = params.interests.map((i) => String(i).trim()).filter(Boolean);

    await userInterestRepository.deleteByUserId(params.userId);
    await Promise.all(
      clean.map((name) =>
        userInterestRepository.create({ UserId: params.userId, name })
      )
    );

    return clean;
  }
}

export const updateInterestsCommand = new UpdateInterestsCommand();
