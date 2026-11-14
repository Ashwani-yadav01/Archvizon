const assignmentService = require('../services/assignmentService');
const { sendSuccess } = require('../utils/response');

class AssignmentController {
  async getProjectAssignments(req, res, next) {
    try {
      const assignments = await assignmentService.getProjectAssignments(req.user, req.params.projectId);
      return sendSuccess(res, 200, 'Project assignments retrieved successfully', { assignments });
    } catch (error) {
      next(error);
    }
  }

  async assignTeamMember(req, res, next) {
    try {
      const assignment = await assignmentService.assignTeamMember(
        req.user,
        req.params.projectId,
        req.body
      );
      return sendSuccess(res, 201, 'Team member assigned successfully', { assignment });
    } catch (error) {
      next(error);
    }
  }

  async removeAssignment(req, res, next) {
    try {
      await assignmentService.removeAssignment(
        req.user,
        req.params.projectId,
        req.params.assignmentId
      );
      return sendSuccess(res, 200, 'Assignment removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();
