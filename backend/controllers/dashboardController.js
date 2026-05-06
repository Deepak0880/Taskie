import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get dashboard stats for logged in user
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    // Get user's projects
    const userProjects = await Project.find({
      'members.user': req.user._id
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Get user's tasks (assigned or created)
    const userTasks = await Task.find({
      $or: [
        { assignee: req.user._id },
        { createdBy: req.user._id }
      ],
      project: { $in: projectIds }
    });

    // Calculate stats
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = userTasks.filter(t => t.status === 'in-progress').length;

    const overdueTasks = userTasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length;

    // Get recent tasks
    const recentTasks = await Task.find({
      $or: [
        { assignee: req.user._id },
        { createdBy: req.user._id }
      ],
      project: { $in: projectIds }
    })
      .populate('project', 'name')
      .populate('assignee', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedRecentTasks = recentTasks.map(t => ({
      id: t._id,
      projectId: t.project?._id,
      projectName: t.project?.name || 'Unknown',
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignee: t.assignee ? { id: t.assignee._id, name: t.assignee.name } : null,
      dueDate: t.dueDate,
      createdBy: t.createdBy,
      createdAt: t.createdAt
    }));

    // Get recent projects
    const recentProjects = await Project.find({
      'members.user': req.user._id
    })
      .populate('members.user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(4);

    // Format projects for frontend
    const formattedProjects = recentProjects.map(p => ({
      ...p.toObject(),
      id: p._id,
      members: p.members.map(m => ({
        ...m,
        id: m.user?._id || m.user?.id,
        name: m.user?.name,
        email: m.user?.email,
        role: m.user?.role
      }))
    }));

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks
      },
      recentTasks: formattedRecentTasks,
      myProjects: formattedProjects
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getDashboard };
