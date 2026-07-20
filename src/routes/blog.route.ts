import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Op } from 'sequelize';
import { BlogPost, User } from '../models';
import { UserRole } from '../enums';
import { ok, created, error } from '../utils/response.util';
import { AppError } from '../errors';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post';
}

export default async function (fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const posts = await BlogPost.findAll({
        where: { isPublished: true },
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl'] }],
        order: [['publishedAt', 'DESC']],
        limit: 20,
      });
      return ok(reply, posts, 'Blog posts loaded');
    } catch {
      return error(reply, 500, 'BLOG_LIST_FAILED', 'Failed to load blog posts');
    }
  });

  fastify.get('/all', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const posts = await BlogPost.findAll({
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl'] }],
        order: [['createdAt', 'DESC']],
      });
      return ok(reply, posts, 'All blog posts loaded');
    } catch {
      return error(reply, 500, 'BLOG_ALL_FAILED', 'Failed to load blog posts');
    }
  });

  fastify.get('/:slug', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { slug } = request.params as { slug: string };
      const post = await BlogPost.findOne({
        where: { slug, isPublished: true },
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl', 'bio'] }],
      });
      if (!post) {
        return error(reply, 404, 'NOT_FOUND', 'Blog post not found');
      }
      return ok(reply, post, 'Blog post loaded');
    } catch {
      return error(reply, 500, 'BLOG_GET_FAILED', 'Failed to load blog post');
    }
  });

  fastify.post('/', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const role = request.user!.role;
    if (role !== UserRole.ADMIN && role !== UserRole.TUTOR) {
      return error(reply, 403, 'FORBIDDEN', 'Only admins and tutors can create blog posts');
    }
    const body = (request.body || {}) as {
      title: string; content: string; excerpt?: string; featuredImage?: string; isPublished?: boolean;
    };
    if (!body.title || !body.content) {
      return error(reply, 400, 'VALIDATION_ERROR', 'Title and content are required');
    }
    try {
      const slug = slugify(body.title);
      const existing = await BlogPost.findOne({ where: { slug } });
      const finalSlug = existing ? slug + '-' + Date.now() : slug;
      const post = await BlogPost.create({
        title: body.title,
        slug: finalSlug,
        content: body.content,
        excerpt: body.excerpt || body.content.slice(0, 200),
        featuredImage: body.featuredImage || null,
        authorId: request.user!.sub,
        isPublished: body.isPublished !== undefined ? body.isPublished : true,
        publishedAt: body.isPublished !== false ? new Date() : undefined,
      });
      return created(reply, post, 'Blog post created');
    } catch (err: unknown) {
      return error(reply, 500, 'BLOG_CREATE_FAILED', 'Failed to create blog post');
    }
  });

  fastify.put('/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const role = request.user!.role;
    if (role !== UserRole.ADMIN && role !== UserRole.TUTOR) {
      return error(reply, 403, 'FORBIDDEN', 'Only admins and tutors can edit blog posts');
    }
    try {
      const { id } = request.params as { id: string };
      const post = await BlogPost.findByPk(id);
      if (!post) {
        return error(reply, 404, 'NOT_FOUND', 'Blog post not found');
      }
      if (post.authorId !== request.user!.sub && role !== UserRole.ADMIN) {
        return error(reply, 403, 'FORBIDDEN', 'You can only edit your own posts');
      }
      const body = (request.body || {}) as any;
      const updates: any = {};
      if (body.title !== undefined) { updates.title = body.title; updates.slug = slugify(body.title); }
      if (body.content !== undefined) updates.content = body.content;
      if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
      if (body.featuredImage !== undefined) updates.featuredImage = body.featuredImage;
      if (body.isPublished !== undefined) {
        updates.isPublished = body.isPublished;
        if (body.isPublished && !post.get('publishedAt')) updates.publishedAt = new Date();
      }
      await post.update(updates);
      return ok(reply, post, 'Blog post updated');
    } catch {
      return error(reply, 500, 'BLOG_UPDATE_FAILED', 'Failed to update blog post');
    }
  });

  fastify.delete('/:id', { preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const post = await BlogPost.findByPk(id);
      if (!post) {
        return error(reply, 404, 'NOT_FOUND', 'Blog post not found');
      }
      await post.destroy();
      return ok(reply, null, 'Blog post deleted');
    } catch {
      return error(reply, 500, 'BLOG_DELETE_FAILED', 'Failed to delete blog post');
    }
  });
}
