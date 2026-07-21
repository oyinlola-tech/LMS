import { Specialization } from '../models/Specialization.model';

export class SpecializationRepository {
  async findAll(): Promise<any[]> {
    return Specialization.findAll({ order: [['name', 'ASC']] });
  }
}

export const specializationRepository = new SpecializationRepository();
