import { Portfolio, PortfolioContact } from '../../../models';

export class ListContactsQuery {
  async execute(userId: string): Promise<PortfolioContact[]> {
    const portfolio = await Portfolio.findOne({ where: { UserId: userId } });
    if (!portfolio) return [];
    return PortfolioContact.findAll({ where: { PortfolioId: portfolio.id }, order: [['createdAt', 'DESC']] });
  }
}
export const listContactsQuery = new ListContactsQuery();
