import { courseRepository } from '../../../repositories/course.repository';

export class GetFeaturedCoursesQuery {
  async execute(): Promise<any[]> {
    return courseRepository.findFeatured();
  }
}

export const getFeaturedCoursesQuery = new GetFeaturedCoursesQuery();
