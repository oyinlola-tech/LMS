import { MentorshipApplication } from '../../../models';

export class GetMentorshipApplicationQuery {
  async execute(userId: string, courseId: string): Promise<MentorshipApplication | null> {
    return MentorshipApplication.findOne({ where: { UserId: userId, CourseId: courseId } });
  }
}
export const getMentorshipApplicationQuery = new GetMentorshipApplicationQuery();
