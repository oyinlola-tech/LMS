import { PortfolioTheme } from '../../../models';

export class ListThemesQuery {
  async execute(): Promise<PortfolioTheme[]> {
    return PortfolioTheme.findAll({ order: [['isPremium', 'ASC'], ['name', 'ASC']] });
  }
}
export const listThemesQuery = new ListThemesQuery();
