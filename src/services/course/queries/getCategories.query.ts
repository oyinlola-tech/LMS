import { specializationRepository } from '../../../repositories/specialization.repository';

export class GetCategoriesQuery {
  async execute(): Promise<any[]> {
    return specializationRepository.findAll();
  }
}

export const getCategoriesQuery = new GetCategoriesQuery();
