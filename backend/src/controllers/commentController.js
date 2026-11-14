const commentService = require('../services/commentService');
const { sendSuccess } = require('../utils/response');

class CommentController {
  async getProjectComments(req, res, next) {
    try {
      const comments = await commentService.getProjectComments(
        req.user,
        req.params.projectId,
        req.query
      );
      return sendSuccess(res, 200, 'Comments retrieved successfully', { comments });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req, res, next) {
    try {
      const comment = await commentService.addComment(
        req.user,
        req.params.projectId,
        req.body
      );
      return sendSuccess(res, 201, 'Comment added successfully', { comment });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      await commentService.deleteComment(req.user, req.params.commentId);
      return sendSuccess(res, 200, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
