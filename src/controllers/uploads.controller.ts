import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs';
import { ok, error } from '../utils/response.util';

const publicBaseUrl = process.env.PUBLIC_BASE_URL;
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadMaxMb = Number(process.env.UPLOAD_MAX_MB) || 5;

export async function uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await request.file();
    if (!data) {
      return error(reply, 400, 'VALIDATION_ERROR', 'file is required');
    }

    const { file: stream, filename: originalname, mimetype } = data;

    if (!mimetype.startsWith('image/')) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Only image files are allowed');
    }

    const maxBytes = uploadMaxMb * 1024 * 1024;
    let fileSize = 0;
    const checkStream = require('stream').PassThrough();
    stream.on('data', (chunk: Buffer) => {
      fileSize += chunk.length;
      if (fileSize > maxBytes) {
        stream.destroy();
        checkStream.destroy();
      }
    });
    stream.pipe(checkStream);

    const uploadPath = path.resolve(uploadDir, 'avatars');
    fs.mkdirSync(uploadPath, { recursive: true });

    const unique = Date.now() + '-' + crypto.randomUUID();
    const safe = originalname.replace(/[^a-zA-Z0-9._-]/g, '');
    const filename = unique + '-' + safe;
    const filePath = path.join(uploadPath, filename);

    const writeStream = fs.createWriteStream(filePath);
    await new Promise<void>((resolve, reject) => {
      checkStream.pipe(writeStream);
      checkStream.on('end', resolve);
      checkStream.on('error', reject);
      writeStream.on('error', reject);
    });

    const stats = fs.statSync(filePath);
    if (stats.size > maxBytes) {
      fs.unlinkSync(filePath);
      return error(reply, 400, 'VALIDATION_ERROR', 'File size exceeds limit');
    }

    const avatarUrl = publicBaseUrl
      ? `${publicBaseUrl}/uploads/avatars/${filename}`
      : `/uploads/avatars/${filename}`;

    return ok(reply, { avatarUrl }, 'Avatar uploaded');
  } catch (err: any) {
    return error(reply, 500, 'AVATAR_UPLOAD_FAILED', 'Failed to upload avatar');
  }
}
