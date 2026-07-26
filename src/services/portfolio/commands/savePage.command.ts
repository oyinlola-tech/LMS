import { Portfolio, PortfolioPage } from '../../../models';

export interface SavePageInput {
  userId: string;
  pageId?: string;
  title?: string;
  slug?: string;
  content?: any;
  type?: string;
  order?: number;
  isVisible?: boolean;
}

export class SavePageCommand {
  async execute(input: SavePageInput): Promise<PortfolioPage> {
    const portfolio = await Portfolio.findOne({ where: { UserId: input.userId } });
    if (!portfolio) { const err: any = new Error('Create a portfolio first'); err.code = 'NOT_FOUND'; err.statusCode = 404; throw err; }

    if (input.pageId) {
      const page = await PortfolioPage.findOne({ where: { id: input.pageId, PortfolioId: portfolio.id } });
      if (!page) { const err: any = new Error('Page not found'); err.code = 'NOT_FOUND'; err.statusCode = 404; throw err; }
      if (input.title !== undefined) page.title = input.title;
      if (input.slug !== undefined) page.slug = input.slug;
      if (input.type !== undefined) page.type = input.type;
      if (input.content !== undefined) page.content = typeof input.content === 'string' ? input.content : JSON.stringify(input.content);
      if (input.order !== undefined) page.order = input.order;
      if (input.isVisible !== undefined) page.isVisible = input.isVisible;
      await page.save();
      return page;
    }

    if (!input.title || !input.slug) { const err: any = new Error('title and slug required'); err.code = 'VALIDATION'; err.statusCode = 400; throw err; }
    return PortfolioPage.create({
      PortfolioId: portfolio.id,
      title: input.title,
      slug: input.slug,
      type: input.type || 'custom',
      content: input.content ? (typeof input.content === 'string' ? input.content : JSON.stringify(input.content)) : null,
      order: input.order || 0,
      isVisible: input.isVisible !== undefined ? input.isVisible : true,
    });
  }
}
export const savePageCommand = new SavePageCommand();

export class DeletePageCommand {
  async execute(userId: string, pageId: string): Promise<void> {
    const portfolio = await Portfolio.findOne({ where: { UserId: userId } });
    if (!portfolio) { const err: any = new Error('No portfolio'); err.code = 'NOT_FOUND'; err.statusCode = 404; throw err; }
    await PortfolioPage.destroy({ where: { id: pageId, PortfolioId: portfolio.id } });
  }
}
export const deletePageCommand = new DeletePageCommand();
