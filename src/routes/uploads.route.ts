import crypto from 'crypto';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs';
import { ok, error } from '../utils/response.util';

const publicBaseUrl = process.env.PUBLIC_BASE_URL;
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

export default async function(fastify: FastifyInstance): Promise<void> {
  fastify.post('/avatar', { preHandler: [fastify.authenticate], config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) {
        return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
      }

      const { file: stream, filename: originalname, mimetype } = data;

      if (!mimetype.startsWith('image/')) {
        return error(reply, 400, 'VALIDATION_ERROR', 'Only image files are allowed');
      }

      const uploadPath = path.resolve(uploadDir, 'avatars');
      fs.mkdirSync(uploadPath, { recursive: true });

      const unique = Date.now() + '-' + crypto.randomUUID();
      const safe = originalname.replace(/[^a-zA-Z0-9._-]/g, '');
      const filename = unique + '-' + safe;
      const filePath = path.join(uploadPath, filename);

      const writeStream = fs.createWriteStream(filePath);
      await new Promise<void>((resolve, reject) => {
        stream.pipe(writeStream);
        stream.on('end', resolve);
        stream.on('error', reject);
        writeStream.on('error', reject);
      });

      const avatarUrl = publicBaseUrl
        ? `${publicBaseUrl}/uploads/avatars/${filename}`
        : `/uploads/avatars/${filename}`;

      return ok(reply, { avatarUrl }, 'Avatar uploaded');
    } catch (err: any) {
      return error(reply, 500, 'AVATAR_UPLOAD_FAILED', 'Failed to upload avatar');
    }
  });
}
