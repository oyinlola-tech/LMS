import { Portfolio, PortfolioPage, PortfolioTheme, PortfolioPlan, User } from '../../../models';

export class GetPublicPortfolioQuery {
  async execute(slug?: string, userId?: string): Promise<{ portfolio: Portfolio | null; pages: PortfolioPage[] } | null> {
    const where: any = { isPublic: true };
    if (slug) where.slug = slug;
    else if (userId) where.UserId = userId;
    else return null;

    const portfolio = await Portfolio.findOne({
      where,
      include: [
        { model: User, attributes: ['id', 'fullName', 'avatarUrl', 'email', 'bio'] },
        { model: PortfolioTheme, as: 'theme' },
        { model: PortfolioPlan, as: 'plan' },
      ],
    });
    if (!portfolio) return null;

    const pages = await PortfolioPage.findAll({ where: { PortfolioId: portfolio.id, isVisible: true }, order: [['order', 'ASC']] });
    return { portfolio, pages };
  }
}
export const getPublicPortfolioQuery = new GetPublicPortfolioQuery();
