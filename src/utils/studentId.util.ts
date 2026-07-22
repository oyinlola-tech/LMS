import { sequelize } from '../config/db.config';
import { QueryTypes } from 'sequelize';

const PREFIX = 'LB';
const SEQUENCE_NAME = 'student_id_seq';

let sequenceEnsured = false;

async function ensureSequence(): Promise<void> {
  if (sequenceEnsured) return;
  await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS "${SEQUENCE_NAME}" START 1`);
  sequenceEnsured = true;
}

export async function generateStudentId(): Promise<string> {
  await ensureSequence();

  const year = new Date().getFullYear().toString().slice(-2);

  const rows = await sequelize.query<{ seq: number }>(
    `SELECT nextval('${SEQUENCE_NAME}') AS seq`,
    { type: QueryTypes.SELECT }
  );

  const seqNum = rows[0].seq;
  return `${PREFIX}/${year}/${String(seqNum).padStart(7, '0')}`;
}
