import { AssignmentRequirement } from '../models/AssignmentRequirement.model';

export class AssignmentRequirementRepository {
  async findByAssignment(assignmentId: string): Promise<any> {
    return AssignmentRequirement.findOne({ where: { AssignmentId: assignmentId } });
  }
}

export const assignmentRequirementRepository = new AssignmentRequirementRepository();
