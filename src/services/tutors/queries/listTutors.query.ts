import { Op } from 'sequelize';
import { User, TutorProfile, Course, Enrollment, CourseReview } from '../../../models';
import { UserRole } from '../../../enums';

export class ListTutorsQuery {
  async execute(params: { limit?: number; offset?: number; search?: string; specialty?: string } = {}) {
    const { limit, offset, search, specialty } = params;
    const where: any = { role: UserRole.TUTOR };
    if (search) {
      where.fullName = { [Op.iLike]: `%${search}%` };
    }
    const opts: any = {
      where,
      include: [{ model: TutorProfile }],
      order: [['createdAt', 'DESC']],
    };
    if (limit) opts.limit = limit;
    if (offset) opts.offset = offset;

    const tutors = await User.findAll(opts);
    const tutorIds = tutors.map(t => t.id);
    let courseCounts: Record<string, number> = {};
    let studentCounts: Record<string, number> = {};
    let ratings: Record<string, number> = {};
    if (tutorIds.length) {
      const courses = await Course.findAll({
        where: { tutorId: { [Op.in]: tutorIds } },
        attributes: ['id', 'tutorId'],
      });
      const tutorCourseIds: Record<string, string[]> = {};
      courses.forEach(c => {
        if (!tutorCourseIds[c.tutorId]) tutorCourseIds[c.tutorId] = [];
        tutorCourseIds[c.tutorId].push(c.id);
      });
      for (const [tid, cids] of Object.entries(tutorCourseIds)) {
        courseCounts[tid] = cids.length;
        studentCounts[tid] = await Enrollment.count({ where: { CourseId: { [Op.in]: cids } } });
      }
      const reviews = await CourseReview.findAll({
        where: { CourseId: { [Op.in]: courses.map(c => c.id) } },
        attributes: ['CourseId', 'rating'],
      });
      const courseRatings: Record<string, number[]> = {};
      reviews.forEach(r => {
        if (!courseRatings[r.CourseId]) courseRatings[r.CourseId] = [];
        courseRatings[r.CourseId].push(r.rating);
      });
      for (const [tid, cids] of Object.entries(tutorCourseIds)) {
        const allRatings = cids.flatMap(id => courseRatings[id] || []);
        ratings[tid] = allRatings.length ? Number((allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length).toFixed(2)) : 0;
      }
    }
    return tutors.map(t => ({
      ...t.toJSON(),
      courseCount: courseCounts[t.id] || 0,
      studentCount: studentCounts[t.id] || 0,
      rating: ratings[t.id] || 0,
    }));
  }
}

export const listMentorsQuery = new ListTutorsQuery();
