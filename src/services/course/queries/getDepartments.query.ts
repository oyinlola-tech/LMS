import { specializationRepository } from '../../../repositories/specialization.repository';
import { courseSpecializationRepository } from '../../../repositories/courseSpecialization.repository';

export interface DepartmentItem {
  id: string;
  name: string;
  iconUrl: string | null;
  description: string | null;
  courseCount: number;
}

export class GetDepartmentsQuery {
  async execute(): Promise<DepartmentItem[]> {
    const categories = await specializationRepository.findAll();
    const countMap = await courseSpecializationRepository.getCourseCountsBySpecialization();
    return categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      iconUrl: c.iconUrl || null,
      description: c.description || null,
      courseCount: countMap[c.id] || 0,
    }));
  }
}

export const getDepartmentsQuery = new GetDepartmentsQuery();
