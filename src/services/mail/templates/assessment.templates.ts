import { baseTemplate, escapeHtml } from '../baseTemplate';

const APP_NAME = process.env.APP_NAME || 'LearnBridge';
const BRAND_APP_URL = process.env.BRAND_APP_URL || '';

export const quizScoreHigh = ({ scorePercent, courseUrl, lessonUrl }: any) => ({
  subject: `Excellent work on your ${APP_NAME} quiz`,
  html: baseTemplate({
    title: 'Outstanding score',
    icon: 'star',
    preheader: `You scored ${scorePercent}%`,
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Amazing job! You scored <strong>${scorePercent}%</strong>.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Keep the momentum and challenge yourself with the next lesson.
      </p>
    `,
    action: { label: 'Continue Learning', url: lessonUrl || courseUrl || BRAND_APP_URL },
    highlight: 'Consistency is your superpower.',
  }),
  text: `Amazing job! You scored ${scorePercent}%. Keep going!`,
});

export const quizScoreAverage = ({ scorePercent, courseUrl, lessonUrl }: any) => ({
  subject: `Keep going on your ${APP_NAME} quiz`,
  html: baseTemplate({
    title: 'Good effort',
    icon: 'clock',
    preheader: `You scored ${scorePercent}%`,
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Nice work! You scored <strong>${scorePercent}%</strong>.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Review the lesson notes and try again to improve your score.
      </p>
    `,
    action: { label: 'Review Lesson', url: lessonUrl || courseUrl || BRAND_APP_URL },
    highlight: 'Small improvements add up quickly.',
  }),
  text: `Nice work! You scored ${scorePercent}%. Review and try again.`,
});

export const quizScoreLow = ({ scorePercent, courseUrl, lessonUrl }: any) => ({
  subject: `You can do this on your ${APP_NAME} quiz`,
  html: baseTemplate({
    title: "Don't give up",
    icon: 'star',
    preheader: `You scored ${scorePercent}%`,
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        You scored <strong>${scorePercent}%</strong>.
      </p>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Go through the lesson once more and try again. You've got this.
      </p>
    `,
    action: { label: 'Try Again', url: lessonUrl || courseUrl || BRAND_APP_URL },
    highlight: 'Progress happens one step at a time.',
  }),
  text: `You scored ${scorePercent}%. Review and try again.`,
});

export const assignmentGraded = ({ score, rubric, submissionUrl }: any) => ({
  subject: `Your ${APP_NAME} assignment was graded`,
  html: baseTemplate({
    title: 'Assignment graded',
    icon: 'document',
    preheader: 'Feedback is available',
    bodyHtml: `
      <p style="margin:0 0 16px; font-size:16px; line-height:1.6; color:#334155;">
        Your assignment has been graded.
      </p>
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td align="center" bgcolor="#f8fafc" style="padding:16px; border-radius:12px; border:1px solid #e2e8f0;">
            <p style="margin:0 0 8px; font-size:14px; color:#64748b;">SCORE</p>
            <p style="margin:0 0 16px; font-size:32px; font-weight:700; color:#000000;">${score || 'N/A'}</p>
            ${rubric ? `<p style="margin:0 0 8px; font-size:14px; color:#64748b;">RUBRIC</p><p style="margin:0; font-size:16px; color:#334155;">${rubric}</p>` : ''}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 0; font-size:16px; line-height:1.6; color:#334155;">
        Keep going — every submission is progress.
      </p>
    `,
    action: submissionUrl ? { label: 'View Feedback', url: submissionUrl } : { label: 'View Course', url: BRAND_APP_URL },
  }),
  text: `Your assignment was graded. Score: ${score || 'N/A'}.`,
});
