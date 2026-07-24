import { User, Course, UserInterest, UserSkillProgress, Enrollment } from '../../../models';

export interface SuggestedCourse {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  difficulty: string;
  price: number | null;
  currency: string;
  reason: string;
}

export interface MarketingCampaign {
  userId: string;
  email: string;
  fullName: string;
  suggestedCourses: SuggestedCourse[];
  unsubscribeToken: string;
}

export class GetSuggestedCoursesQuery {
  async execute(userId: string, limit = 5): Promise<SuggestedCourse[]> {
    const user = await User.findByPk(userId);
    if (!user) return [];

    const interests = await UserInterest.findAll({ where: { UserId: userId }, attributes: ['skill'] });
    const skillProgress = await UserSkillProgress.findAll({ where: { UserId: userId }, attributes: ['skill', 'level'] });

    const interestSkills = interests.map((i: any) => i.skill.toLowerCase());
    const skills = skillProgress.map((s: any) => ({ skill: s.skill.toLowerCase(), level: s.level }));
    const weakSkills = skills.filter((s: any) => ['beginner', 'intermediate'].includes(s.level)).map((s: any) => s.skill);

    const enrolledCourses = await Enrollment.findAll({
      where: { UserId: userId },
      attributes: ['CourseId'],
    });
    const enrolledIds = enrolledCourses.map((e: any) => e.CourseId);

    const allCourses = await Course.findAll({
      where: {
        isPublished: true,
        id: { [require('sequelize').Op.notIn]: enrolledIds },
      },
      include: [
        { model: User, as: 'tutor', attributes: ['id'] },
      ],
      limit: 50,
    });

    const scored = allCourses.map((course: any) => {
      const title = (course.title || '').toLowerCase();
      const desc = (course.description || '').toLowerCase();
      const text = title + ' ' + desc;
      let score = 0;
      let reason = 'Recommended for you';

      interestSkills.forEach(skill => {
        if (text.includes(skill)) { score += 3; reason = `Matches your interest in ${skill}`; }
      });

      weakSkills.forEach(skill => {
        if (text.includes(skill)) { score += 5; reason = `Improve your ${skill} skills`; }
      });

      if (course.difficulty === 'beginner' && skills.some((s: any) => s.level === 'beginner')) score += 2;
      if (course.difficulty === 'expert' && skills.some((s: any) => s.level === 'advanced')) score += 2;

      return { ...course, score, reason };
    });

    scored.sort((a: any, b: any) => b.score - a.score);

    return scored.slice(0, limit).map((c: any) => ({
      id: c.id,
      title: c.title,
      thumbnailUrl: c.thumbnailUrl,
      difficulty: c.difficulty,
      price: c.price,
      currency: c.currency,
      reason: c.reason,
    }));
  }
}

export const getSuggestedCoursesQuery = new GetSuggestedCoursesQuery();
