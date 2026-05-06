import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember
} from '../controllers/projectController.js';
import {
  getTasks,
  createTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);

// Nested task routes
router.get('/:projectId/tasks', getTasks);
router.post('/:projectId/tasks', createTask);

export default router;
