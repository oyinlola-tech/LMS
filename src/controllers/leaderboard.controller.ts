import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, error } from '../utils/response.util';
import { Op } from 'sequelize';
import { User, Enrollment, UserStreak, CourseCertificate } from '../models';

export async function getTopStudents(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const students = await User.findAll({
      where: { role: 'learner', status: 'active' },
      attributes: ['id', 'fullName', 'avatarUrl', 'studentId'],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    const userIds = students.map(s => s.id);
    const [enrollmentCount, streaks, certificateCount] = await Promise.all([
      Enrollment.count({ where: { UserId: { [Op.in]: userIds } } }),
      UserStreak.findAll({ where: { UserId: { [Op.in]: userIds } }, attributes: ['UserId', 'currentStreak'] }),
      CourseCertificate.count({ where: { UserId: { [Op.in]: userIds } } }),
    ]);
    const items = students.map((s: any) => ({
      id: s.id,
      fullName: s.fullName,
      avatarUrl: s.avatarUrl,
      courseName: '',
      points: enrollmentCount * 10 + (streaks.find((ss: any) => ss.UserId === s.id)?.currentStreak || 0) * 5 + certificateCount * 20,
      badgeCount: certificateCount,
    }));
    items.sort((a, b) => b.points - a.points);
    return ok(reply, items, 'Leaderboard loaded');
  } catch (err) {
    return error(reply, 500, 'LEADERBOARD_FAILED', 'Failed to load leaderboard');
  }
}

export async function getWeeklyChallenge(_request: FastifyRequest, reply: FastifyReply) {
  try {
    return ok(reply, { title: 'Weekly Learning Sprint', description: 'Complete 3 new lessons this week to earn bonus points', progress: 0, endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }, 'Challenge loaded');
  } catch (err) {
    return error(reply, 500, 'CHALLENGE_FAILED', 'Failed to load challenge');
  }
}

export async function getBadges(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const badges = [
      { id: '1', name: 'First Steps', description: 'Complete your first lesson', icon: 'school', earned: true },
      { id: '2', name: 'Quiz Master', description: 'Score 100% on a quiz', icon: 'emoji_events', earned: true },
      { id: '3', name: 'Social Butterfly', description: 'Make your first connection', icon: 'groups', earned: true },
      { id: '4', name: 'Streak Champion', description: 'Maintain a 7-day learning streak', icon: 'local_fire_department', earned: false },
      { id: '5', name: 'Course Completer', description: 'Finish your first course', icon: 'verified', earned: false },
      { id: '6', name: 'Mentor', description: 'Help 5 students with questions', icon: 'support_agent', earned: false },
    ];
    return ok(reply, badges, 'Badges loaded');
  } catch (err) {
    return error(reply, 500, 'BADGES_FAILED', 'Failed to load badges');
  }
}
