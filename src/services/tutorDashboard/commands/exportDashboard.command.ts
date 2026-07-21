import { getTutorOverviewQuery, TutorOverview } from '../queries/getOverview.query';

export class ExportDashboardCommand {
  async execute(tutorId: string): Promise<{ overview: TutorOverview; exportedAt: Date }> {
    const overview = await getTutorOverviewQuery.execute(tutorId);
    return { overview, exportedAt: new Date() };
  }
}
export const exportDashboardCommand = new ExportDashboardCommand();
