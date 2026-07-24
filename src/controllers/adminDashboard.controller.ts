import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole, UserStatus } from '../enums';
import { Op } from 'sequelize';
import PDFDocument from 'pdfkit';
import { ok, error } from '../utils/response.util';
import {
  User,
  Course,
  Enrollment,
  AssignmentSubmission,
  CourseCertificate,
  AdminAuditLog,
} from '../models';

const toDateOnly = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const weekStart = (date: Date | string) => {
  const d = toDateOnly(new Date(date));
  const day = d.getUTCDay() || 7;
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  return d.toISOString().slice(0, 10);
};

const buildWeeklySeries = (users: any[], labelWeeks: string[]) => {
  const buckets = labelWeeks.reduce((acc: Record<string, number>, w: string) => {
    acc[w] = 0;
    return acc;
  }, {});
  users.forEach((u: any) => {
    const key = weekStart(u.createdAt);
    if (key in buckets) buckets[key] += 1;
  });
  return labelWeeks.map((w) => ({ weekStart: w, count: buckets[w] || 0 }));
};

const renderBar = (doc: any, label: string, value: number, max: number, width = 24) => {
  const ratio = max > 0 ? value / max : 0;
  const filled = Math.max(1, Math.round(ratio * width));
  const bar = `${'█'.repeat(filled)}${'░'.repeat(Math.max(0, width - filled))}`;
  doc.fontSize(10).text(`${label.padEnd(18)} ${bar} ${value}`);
};

export const getAdminDashboard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const range = String((request.query as any).range || '7d');
    const rangeDays = range === '30d' ? 30 : 7;
    const now = new Date();
    const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(now.getTime() - rangeDays * 2 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.count();
    const usersInRange = Number(await User.count({ where: { createdAt: { [Op.gte]: startDate } } as any }));
    const usersPrevRange = Number(await User.count({
      where: { createdAt: { [Op.gte]: prevStartDate, [Op.lt]: startDate } } as any,
    }));
    const userGrowthPercent = usersPrevRange
      ? Math.round(((usersInRange - usersPrevRange) / usersPrevRange) * 100)
      : usersInRange > 0 ? 100 : 0;

    const activeCourses = await Course.count({ where: { isPublished: true } });
    const pendingAllocations = await AssignmentSubmission.count({ where: { status: 'submitted' } });

    const avgLatencyMs = Number(process.env.ADMIN_AVG_LATENCY_MS || 15);
    const uptimePercent = Number(process.env.ADMIN_UPTIME_PERCENT || 99.9);

    const weeks: string[] = [];
    const weekCount = rangeDays === 30 ? 6 : 3;
    for (let i = weekCount - 1; i >= 0; i -= 1) {
      const w = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      weeks.push(weekStart(w));
    }

    const usersForSeries = await User.findAll({
      where: { createdAt: { [Op.gte]: new Date(now.getTime() - weekCount * 7 * 24 * 60 * 60 * 1000) } } as any,
      attributes: ['id', 'role', 'createdAt'],
    });
    const learners = usersForSeries.filter((u: any) => u.role === UserRole.LEARNER);
    const tutors = usersForSeries.filter((u: any) => u.role === UserRole.TUTOR);

    const learnersSeries = buildWeeklySeries(learners, weeks);
    const tutorsSeries = buildWeeklySeries(tutors, weeks);

    const totalLearners = await User.count({ where: { role: UserRole.LEARNER } });
    const enrolledLearnersCount = await (Enrollment.count as any)({
      distinct: true,
      col: 'UserId',
      include: [{ model: User, attributes: [], where: { role: UserRole.LEARNER } }],
    });
    const trainingCount = await (Enrollment.count as any)({
      distinct: true,
      col: 'UserId',
      where: { status: UserStatus.ACTIVE },
    });
    const allocatedCount = await (Enrollment.count as any)({
      distinct: true,
      col: 'UserId',
      where: { status: 'completed' },
    });
    const certifiedCount = await (CourseCertificate.count as any)({
      distinct: true,
      col: 'UserId',
    });
    const onboardingCount = totalLearners - Number(enrolledLearnersCount);

    const percent = (value: number) => (totalLearners ? Math.round((value / totalLearners) * 100) : 0);

    const auditTrail = await AdminAuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    return ok(reply, {
      range: rangeDays,
      totals: {
        users: totalUsers,
        userGrowthPercent,
        activeCourses,
        pendingAllocations,
        avgLatencyMs,
        uptimePercent,
      },
      userGrowthVector: {
        weeks,
        learners: learnersSeries,
        tutors: tutorsSeries,
      },
      mentorshipFlow: {
        totalLearners,
        onboarding: { count: onboardingCount, percent: percent(onboardingCount) },
        training: { count: trainingCount, percent: percent(trainingCount) },
        certified: { count: certifiedCount, percent: percent(certifiedCount) },
        allocated: { count: allocatedCount, percent: percent(allocatedCount) },
      },
      auditTrail,
    }, 'Admin dashboard loaded');
  } catch (err: any) {
    return error(reply, 500, 'ADMIN_DASHBOARD_FAILED', 'Failed to load admin dashboard');
  }
};

export const exportAdminDashboard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const range = String((request.query as any).range || '7d');
    const rangeDays = range === '30d' ? 30 : 7;
    const now = new Date();
    const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const totalUsers = await User.count();
    const usersInRange = Number(await User.count({ where: { createdAt: { [Op.gte]: startDate } } as any }));
    const activeCourses = await Course.count({ where: { isPublished: true } });
    const pendingAllocations = await AssignmentSubmission.count({ where: { status: 'submitted' } });

    const rows = [
      ['range_days', rangeDays],
      ['total_users', totalUsers],
      ['new_users', usersInRange],
      ['active_courses', activeCourses],
      ['pending_allocations', pendingAllocations],
      ['avg_latency_ms', Number(process.env.ADMIN_AVG_LATENCY_MS || 15)],
      ['uptime_percent', Number(process.env.ADMIN_UPTIME_PERCENT || 99.9)],
    ];

    const csv = ['metric,value', ...rows.map((r) => r.join(','))].join('\n');
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="admin-summary.csv"');
    return reply.send(csv);
  } catch (err: any) {
    return error(reply, 500, 'ADMIN_EXPORT_FAILED', 'Failed to export summary');
  }
};

export const getReport = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const format = String((request.query as any).format || 'json').toLowerCase();
    const range = String((request.query as any).range || '7d');
    const rangeDays = range === '30d' ? 30 : 7;
    const now = new Date();
    const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const totalUsers = await User.count();
    const usersInRange = Number(await User.count({ where: { createdAt: { [Op.gte]: startDate } } as any }));
    const activeCourses = await Course.count({ where: { isPublished: true } });
    const pendingAllocations = await AssignmentSubmission.count({ where: { status: 'submitted' } });
    const auditTrail = await AdminAuditLog.findAll({ order: [['createdAt', 'DESC']], limit: 10 });

    const report = {
      generatedAt: now.toISOString(),
      rangeDays,
      metrics: {
        totalUsers,
        newUsers: usersInRange,
        activeCourses,
        pendingAllocations,
        avgLatencyMs: Number(process.env.ADMIN_AVG_LATENCY_MS || 15),
        uptimePercent: Number(process.env.ADMIN_UPTIME_PERCENT || 99.9),
      },
      auditTrail,
    };

    if (format === 'pdf') {
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', 'attachment; filename="admin-report.pdf"');
      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(reply.raw);
      doc.fontSize(18).text('LearnBridge Admin Report', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${report.generatedAt}`);
      doc.text(`Range (days): ${report.rangeDays}`);
      doc.moveDown();
      doc.fontSize(14).text('Summary Metrics');
      doc.fontSize(12).text(`Total users: ${report.metrics.totalUsers}`);
      doc.text(`New users: ${report.metrics.newUsers}`);
      doc.text(`Active courses: ${report.metrics.activeCourses}`);
      doc.text(`Pending allocations: ${report.metrics.pendingAllocations}`);
      doc.text(`Avg latency: ${report.metrics.avgLatencyMs} ms`);
      doc.text(`Uptime: ${report.metrics.uptimePercent}%`);
      doc.moveDown();
      doc.fontSize(14).text('Growth Snapshot');
      const maxValue = Math.max(report.metrics.totalUsers, report.metrics.newUsers, report.metrics.activeCourses, 1);
      renderBar(doc, 'Total Users', report.metrics.totalUsers, maxValue);
      renderBar(doc, 'New Users', report.metrics.newUsers, maxValue);
      renderBar(doc, 'Active Courses', report.metrics.activeCourses, maxValue);
      renderBar(doc, 'Pending Alloc', report.metrics.pendingAllocations, maxValue);
      doc.moveDown();
      doc.fontSize(14).text('Recent Audit Trail');
      report.auditTrail.forEach((log: any) => {
        doc.fontSize(11).text(`${log.title} - ${log.status} - ${log.createdAt}`);
        doc.fontSize(10).text(log.content);
        doc.moveDown(0.5);
      });
      doc.end();
      return;
    }

    return ok(reply, report, 'Admin report generated');
  } catch (err: any) {
    return error(reply, 500, 'ADMIN_REPORT_FAILED', 'Failed to generate report');
  }
};

export const getAuditTrail = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const limit = Number((request.query as any).limit || 50);
    const logs = await AdminAuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: Math.min(limit, 200),
    });
    return ok(reply, logs, 'Audit trail loaded');
  } catch (err: any) {
    return error(reply, 500, 'AUDIT_TRAIL_FAILED', 'Failed to load audit trail');
  }
};