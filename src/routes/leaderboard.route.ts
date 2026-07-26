import { FastifyInstance } from 'fastify';
import { getTopStudents, getWeeklyChallenge, getBadges } from '../controllers/leaderboard.controller';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.get('/top', getTopStudents);
  fastify.get('/weekly', getWeeklyChallenge);
  fastify.get('/badges', getBadges);
}
