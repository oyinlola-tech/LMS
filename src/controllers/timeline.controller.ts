import { FastifyRequest, FastifyReply } from 'fastify';
import { ok, created, error } from '../utils/response.util';
import { createPostCommand } from '../services/timeline/commands/createPost.command';
import { likePostCommand } from '../services/timeline/commands/likePost.command';
import { commentPostCommand } from '../services/timeline/commands/commentPost.command';
import { likeCommentCommand } from '../services/timeline/commands/likeComment.command';
import { bookmarkPostCommand } from '../services/timeline/commands/bookmarkPost.command';
import { reportPostCommand } from '../services/timeline/commands/reportPost.command';
import { deletePostCommand } from '../services/timeline/commands/deletePost.command';
import { getTimelinePostsQuery } from '../services/timeline/queries/getTimelinePosts.query';
import { getPostCommentsQuery } from '../services/timeline/queries/getPostComments.query';
import { getUserPostsQuery } from '../services/timeline/queries/getUserPosts.query';
import { getRecommendedUsersQuery } from '../services/timeline/queries/getRecommendedUsers.query';

export const createPost = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { body, imageUrl, tags } = (request.body as Record<string, any>) || {};
    const post = await createPostCommand.execute({ userId: request.user!.sub, body, imageUrl, tags });
    return created(reply, post, 'Post created');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'POST_CREATE_FAILED', err.message || 'Failed to create post');
  }
};

export const likePost = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await likePostCommand.execute(request.user!.sub, (request.params as any).postId);
    return ok(reply, result, result.liked ? 'Post liked' : 'Post unliked');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'LIKE_FAILED', err.message || 'Failed to like post');
  }
};

export const commentOnPost = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { body, parentId } = (request.body as Record<string, any>) || {};
    const comment = await commentPostCommand.execute({
      userId: request.user!.sub,
      postId: (request.params as any).postId,
      body,
      parentId,
    });
    return created(reply, comment, 'Comment added');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'COMMENT_FAILED', err.message || 'Failed to comment');
  }
};

export const likeComment = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await likeCommentCommand.execute(request.user!.sub, (request.params as any).commentId);
    return ok(reply, result, result.liked ? 'Comment liked' : 'Comment unliked');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'LIKE_COMMENT_FAILED', err.message || 'Failed to like comment');
  }
};

export const bookmarkPost = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await bookmarkPostCommand.execute(request.user!.sub, (request.params as any).postId);
    return ok(reply, result, result.bookmarked ? 'Post bookmarked' : 'Bookmark removed');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'BOOKMARK_FAILED', err.message || 'Failed to bookmark');
  }
};

export const reportContent = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { postId, commentId, reason } = (request.body as Record<string, any>) || {};
    const report = await reportPostCommand.execute({ reporterId: request.user!.sub, reason, postId, commentId });
    return created(reply, report, 'Content reported');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'REPORT_FAILED', err.message || 'Failed to report');
  }
};

export const deletePost = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await deletePostCommand.execute(request.user!.sub, (request.params as any).postId, request.user!.role);
    return ok(reply, null, 'Post deleted');
  } catch (err: any) {
    return error(reply, err.statusCode || 500, err.code || 'DELETE_FAILED', err.message || 'Failed to delete post');
  }
};

export const getTimeline = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { page, limit } = request.query as any;
    const result = await getTimelinePostsQuery.execute(request.user!.sub, { page: Number(page), limit: Number(limit) });
    return ok(reply, result, 'Timeline loaded');
  } catch (err: any) {
    return error(reply, 500, 'TIMELINE_FAILED', 'Failed to load timeline');
  }
};

export const getPostComments = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { page, limit } = request.query as any;
    const result = await getPostCommentsQuery.execute(request.user!.sub, (request.params as any).postId, { page: Number(page), limit: Number(limit) });
    return ok(reply, result, 'Comments loaded');
  } catch (err: any) {
    return error(reply, 500, 'COMMENTS_FAILED', 'Failed to load comments');
  }
};

export const getUserPosts = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { page, limit } = request.query as any;
    const result = await getUserPostsQuery.execute(request.user!.sub, (request.params as any).userId, { page: Number(page), limit: Number(limit) });
    return ok(reply, result, 'User posts loaded');
  } catch (err: any) {
    return error(reply, 500, 'USER_POSTS_FAILED', 'Failed to load user posts');
  }
};

export const getRecommendedUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { page, limit } = request.query as any;
    const result = await getRecommendedUsersQuery.execute(request.user!.sub, { page: Number(page), limit: Number(limit) });
    return ok(reply, result, 'Recommended users loaded');
  } catch (err: any) {
    return error(reply, 500, 'RECOMMENDED_FAILED', 'Failed to load recommendations');
  }
};
