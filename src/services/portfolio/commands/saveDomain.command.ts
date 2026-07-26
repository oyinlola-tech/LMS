import crypto from 'crypto';
import { Portfolio, PortfolioDomain, PortfolioPlan } from '../../../models';

export class SaveDomainCommand {
  async execute(userId: string, domain: string): Promise<{ domain: string; verificationToken: string; dnsRecord: string }> {
    const portfolio = await Portfolio.findOne({ where: { UserId: userId } });
    if (!portfolio) { const err: any = new Error('No portfolio'); err.code = 'NOT_FOUND'; err.statusCode = 404; throw err; }
    if (!portfolio.planId) { const err: any = new Error('Custom domains require a pro plan'); err.code = 'UPGRADE'; err.statusCode = 403; throw err; }
    const plan = await PortfolioPlan.findByPk(portfolio.planId);
    if (!plan || plan.slug === 'free' || plan.price <= 0) { const err: any = new Error('Custom domains require a paid plan'); err.code = 'UPGRADE'; err.statusCode = 403; throw err; }

    const existing = await PortfolioDomain.findOne({ where: { domain, PortfolioId: { [require('sequelize').Op.ne]: portfolio.id } } });
    if (existing) { const err: any = new Error('Domain already in use'); err.code = 'DOMAIN_TAKEN'; err.statusCode = 409; throw err; }

    const token = crypto.randomBytes(32).toString('hex');
    await PortfolioDomain.upsert({ PortfolioId: portfolio.id, domain, verificationToken: token, verified: false });
    return { domain, verificationToken: token, dnsRecord: `TXT _portfolio-verify ${token}` };
  }
}
export const saveDomainCommand = new SaveDomainCommand();

export class VerifyDomainCommand {
  async execute(userId: string): Promise<PortfolioDomain> {
    const portfolio = await Portfolio.findOne({ where: { UserId: userId } });
    if (!portfolio) { const err: any = new Error('No portfolio'); err.code = 'NOT_FOUND'; err.statusCode = 404; throw err; }
    const pd = await PortfolioDomain.findOne({ where: { PortfolioId: portfolio.id } });
    if (!pd) { const err: any = new Error('No domain configured'); err.code = 'NOT_FOUND'; err.statusCode = 404; throw err; }
    pd.verified = true;
    await pd.save();
    return pd;
  }
}
export const verifyDomainCommand = new VerifyDomainCommand();
