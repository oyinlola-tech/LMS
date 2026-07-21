import { User } from '../models';

const PREFIX = 'LB';
const YEAR = new Date().getFullYear().toString().slice(-2);

export async function generateStudentId(): Promise<string> {
  const lastUser = await User.findOne({
    where: { role: 'learner' },
    order: [['createdAt', 'DESC']],
    attributes: ['studentId'],
    paranoid: false,
  });

  let nextNum = 1;
  if (lastUser && lastUser.studentId) {
    const parts = lastUser.studentId.split('/');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  const padded = String(nextNum).padStart(5, '0');
  return `${PREFIX}/${YEAR}/${padded}`;
}
