import { PortfolioPlan } from '../../../models';

export class ListPlansQuery {
  async execute(includeInactive = false): Promise<PortfolioPlan[]> {
    const where: any = {};
    if (!includeInactive) where.isActive = true;
    return PortfolioPlan.findAll({ where, order: [['price', 'ASC']] });
  }
}
export const listPlansQuery = new ListPlansQuery();
