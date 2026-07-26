import { Portfolio, PortfolioPage, PortfolioPlan, User, Enrollment } from '../../../models';

export interface SavePortfolioInput {
  userId: string;
  slug?: string;
  headline?: string;
  bio?: string;
  skills?: any;
  socialLinks?: any;
  certifications?: any;
  education?: any;
  experience?: any;
  isPublic?: boolean;
  themeId?: string;
  customColors?: any;
  images?: any;
}

export class SavePortfolioCommand {
  async execute(input: SavePortfolioInput): Promise<Portfolio> {
    const completed = await Enrollment.count({ where: { UserId: input.userId, status: 'completed' } });
    if (completed < 1) {
      const err: any = new Error('Complete at least one course to create a portfolio');
      err.code = 'INSUFFICIENT'; err.statusCode = 400; throw err;
    }

    let portfolio = await Portfolio.findOne({ where: { UserId: input.userId } });
    if (portfolio) {
      if (input.headline !== undefined) portfolio.headline = input.headline;
      if (input.bio !== undefined) portfolio.bio = input.bio;
      if (input.skills !== undefined) portfolio.skills = input.skills;
      if (input.socialLinks !== undefined) portfolio.socialLinks = input.socialLinks;
      if (input.certifications !== undefined) portfolio.certifications = input.certifications;
      if (input.education !== undefined) portfolio.education = input.education;
      if (input.experience !== undefined) portfolio.experience = input.experience;
      if (input.isPublic !== undefined) portfolio.isPublic = input.isPublic;
      if (input.themeId !== undefined) portfolio.themeId = input.themeId;
      if (input.customColors !== undefined) portfolio.customColors = input.customColors;
      if (input.images !== undefined) portfolio.images = input.images;
      if (input.slug !== undefined) {
        const existing = await Portfolio.findOne({ where: { slug: input.slug, UserId: { [require('sequelize').Op.ne]: input.userId } } });
        if (existing) { const err: any = new Error('Slug already taken'); err.code = 'SLUG_TAKEN'; err.statusCode = 409; throw err; }
        portfolio.slug = input.slug;
      }
      await portfolio.save();
      return portfolio;
    }

    if (!input.slug) { const err: any = new Error('slug is required'); err.code = 'VALIDATION'; err.statusCode = 400; throw err; }
    const slugExists = await Portfolio.findOne({ where: { slug: input.slug } });
    if (slugExists) { const err: any = new Error('Slug already taken'); err.code = 'SLUG_TAKEN'; err.statusCode = 409; throw err; }

    const user = await User.findByPk(input.userId, { attributes: ['fullName'] });
    const freePlan = await PortfolioPlan.findOne({ where: { slug: 'free', isActive: true } });

    portfolio = await Portfolio.create({
      UserId: input.userId,
      headline: input.headline || null,
      bio: input.bio || (user ? user.fullName : null),
      skills: input.skills || null,
      socialLinks: input.socialLinks || null,
      certifications: input.certifications || null,
      education: input.education || null,
      experience: input.experience || null,
      slug: input.slug,
      isPublic: input.isPublic !== undefined ? input.isPublic : true,
      themeId: input.themeId || null,
      customColors: input.customColors || null,
      images: input.images || null,
      planId: freePlan ? freePlan.id : null,
    });

    await PortfolioPage.create({ PortfolioId: portfolio.id, title: 'About', slug: 'about', content: JSON.stringify([{ type: 'text', value: '' }]), order: 0 });
    await PortfolioPage.create({ PortfolioId: portfolio.id, title: 'Portfolio', slug: 'portfolio', content: JSON.stringify([{ type: 'text', value: '' }]), order: 1 });

    return portfolio;
  }
}
export const savePortfolioCommand = new SavePortfolioCommand();
