import { Portfolio, PortfolioPage, PortfolioTheme, PortfolioPlan, PortfolioContact, PortfolioDomain, User } from '../../../models';

export class GetMyPortfolioQuery {
  async execute(userId: string) {
    const portfolio = await Portfolio.findOne({
      where: { UserId: userId },
      include: [
        { model: User, attributes: ['id', 'fullName', 'avatarUrl', 'bio', 'email'] },
        { model: PortfolioTheme, as: 'theme' },
        { model: PortfolioPlan, as: 'plan' },
      ],
    });
    const pages = portfolio ? await PortfolioPage.findAll({ where: { PortfolioId: portfolio.id }, order: [['order', 'ASC']] }) : [];
    const contacts = portfolio ? await PortfolioContact.findAll({ where: { PortfolioId: portfolio.id }, order: [['createdAt', 'DESC']], limit: 20 }) : [];
    const domain = portfolio ? await PortfolioDomain.findOne({ where: { PortfolioId: portfolio.id } }) : null;
    return { portfolio: portfolio || null, pages, contacts, domain };
  }
}
export const getMyPortfolioQuery = new GetMyPortfolioQuery();
