const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', organizationController.createOrganization);
router.get('/me', organizationController.getMyOrganization);
router.put('/:id', organizationController.updateOrganization);
router.post('/:id/members', organizationController.addMember);
router.post('/:id/members/provision', organizationController.provisionMember);
router.patch('/:id/members/:userId/role', organizationController.updateMemberRole);
router.delete('/:id/members/:userId', organizationController.removeMember);

module.exports = router;
