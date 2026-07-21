import { courseRepository } from '../../../repositories/course.repository';
import { userInterestRepository } from '../../../repositories/userInterest.repository';

export class GetRecommendedCoursesQuery {
  async execute(userId: string): Promise<any[]> {
    const interests = await userInterestRepository.findByUserId(userId);
    const names = interests.map((i: any) => i.name);
    return courseRepository.findRecommendedByInterests(names);
  }
}

export const getRecommendedCoursesQuery = new GetRecommendedCoursesQuery();
