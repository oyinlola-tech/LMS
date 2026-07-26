import { sequelize } from '../config/db.config';
import { QueryTypes } from 'sequelize';

const PREFIX = 'LB';

let sequencesEnsured = false;

async function ensureSequences(): Promise<void> {
  if (sequencesEnsured) return;
  await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS "student_id_seq" START 1`);
  await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS "tutor_id_seq" START 1`);
  await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS "admin_id_seq" START 1`);
  sequencesEnsured = true;
}

export async function generateStudentId(): Promise<string> {
  await ensureSequences();
  const year = new Date().getFullYear().toString().slice(-2);
  const rows = await sequelize.query<{ seq: number }>(
    `SELECT nextval('student_id_seq') AS seq`,
    { type: QueryTypes.SELECT }
  );
  const seqNum = rows[0].seq;
  return `${PREFIX}/${year}/${String(seqNum).padStart(7, '0')}`;
}

export async function generateTutorId(): Promise<string> {
  await ensureSequences();
  const year = new Date().getFullYear().toString().slice(-2);
  const rows = await sequelize.query<{ seq: number }>(
    `SELECT nextval('tutor_id_seq') AS seq`,
    { type: QueryTypes.SELECT }
  );
  const seqNum = rows[0].seq;
  return `TCH/${year}/${String(seqNum).padStart(5, '0')}`;
}

export async function generateAdminId(): Promise<string> {
  await ensureSequences();
  const rows = await sequelize.query<{ seq: number }>(
    `SELECT nextval('admin_id_seq') AS seq`,
    { type: QueryTypes.SELECT }
  );
  const seqNum = rows[0].seq;
  return `ADM/${String(seqNum).padStart(5, '0')}`;
}
