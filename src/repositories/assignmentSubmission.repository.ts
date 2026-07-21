import { AssignmentSubmission } from '../models/AssignmentSubmission.model';
import { User } from '../models/User.model';
import { Op } from 'sequelize';

export class AssignmentSubmissionRepository {
  async findLatestByUser(assignmentId: string, userId: string): Promise<any> {
    return AssignmentSubmission.findOne({
      where: { AssignmentId: assignmentId, UserId: userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findAllByUser(assignmentId: string, userId: string): Promise<any[]> {
    return AssignmentSubmission.findAll({
      where: { AssignmentId: assignmentId, UserId: userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findLatestForAssignments(assignmentIds: string[], userId: string): Promise<any[]> {
    const submissions = await AssignmentSubmission.findAll({
      where: { UserId: userId, AssignmentId: { [Op.in]: assignmentIds } },
      order: [['createdAt', 'DESC']],
    });
    const map: Record<string, any> = {};
    for (const s of submissions) {
      if (!map[s.AssignmentId]) map[s.AssignmentId] = s;
    }
    return Object.values(map);
  }

  async findByIdAndAssignment(id: string, assignmentId: string, includeUser?: boolean): Promise<any> {
    const include: any[] = [];
    if (includeUser) {
      include.push({ model: User, attributes: ['id', 'fullName', 'avatarUrl', 'email'] });
    }
    return AssignmentSubmission.findOne({
      where: { id, AssignmentId: assignmentId },
      include: include.length ? include : undefined,
    });
  }

  async findByIdAndAssignmentAndUser(id: string, assignmentId: string, userId: string): Promise<any> {
    return AssignmentSubmission.findOne({
      where: { id, AssignmentId: assignmentId, UserId: userId },
    });
  }

  async findAllByAssignment(assignmentId: string): Promise<any[]> {
    return AssignmentSubmission.findAll({
      where: { AssignmentId: assignmentId },
      include: [{ model: User, attributes: ['id', 'fullName', 'avatarUrl', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  async create(data: Record<string, any>): Promise<any> {
    return AssignmentSubmission.create(data);
  }

  async save(submission: any): Promise<any> {
    return submission.save();
  }
}

export const assignmentSubmissionRepository = new AssignmentSubmissionRepository();
