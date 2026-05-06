import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role')
      .sort({ createdAt: -1 });

    // Format projects for frontend
    const formattedProjects = projects.map(p => ({
      ...p.toObject(),
      id: p._id,
      members: p.members.map(m => ({
        _id: m.user?._id,
        id: m.user?._id,
        name: m.user?.name,
        email: m.user?.email,
        role: m.user?.role,
        memberRole: m.role,
        joinedAt: m.joinedAt
      }))
    }));

    res.json(formattedProjects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Format project for frontend
    const formattedProject = {
      ...project.toObject(),
      id: project._id,
      members: project.members.map(m => ({
        _id: m.user?._id,
        id: m.user?._id,
        name: m.user?.name,
        email: m.user?.email,
        role: m.user?.role,
        memberRole: m.role,
        joinedAt: m.joinedAt
      }))
    };

    res.json(formattedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, color, members = [] } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Build members array with creator as admin
    const projectMembers = [{ user: req.user._id, role: 'admin' }];

    // Add additional members by email
    if (members.length > 0) {
      for (const email of members) {
        const user = await User.findOne({ email });
        if (user && !projectMembers.some(m => m.user.toString() === user._id.toString())) {
          projectMembers.push({ user: user._id, role: user.role });
        }
      }
    }

    const project = await Project.create({
      name,
      description: description || '',
      color: color || '#6366f1',
      createdBy: req.user._id,
      members: projectMembers
    });

    await project.populate('createdBy', 'name email');
    await project.populate('members.user', 'name email role');

    // Format for frontend
    const formattedProject = {
      ...project.toObject(),
      id: project._id,
      members: project.members.map(m => ({
        _id: m.user?._id,
        id: m.user?._id,
        name: m.user?.name,
        email: m.user?.email,
        role: m.user?.role,
        memberRole: m.role,
        joinedAt: m.joinedAt
      }))
    };

    res.status(201).json(formattedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is creator or admin
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role');

    // Format for frontend
    const formattedProject = {
      ...updatedProject.toObject(),
      id: updatedProject._id,
      members: updatedProject.members.map(m => ({
        _id: m.user?._id,
        id: m.user?._id,
        name: m.user?.name,
        email: m.user?.email,
        role: m.user?.role,
        memberRole: m.role,
        joinedAt: m.joinedAt
      }))
    };

    res.json(formattedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    
    await Project.deleteOne({ _id: req.params.id });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAlreadyMember = project.members.some(
      m => m.user.toString() === targetUser._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push({
      user: targetUser._id,
      role: targetUser.role
    });

    await project.save();
    await project.populate('members.user', 'name email role');

    // Format for frontend
    const formattedProject = {
      ...project.toObject(),
      id: project._id,
      members: project.members.map(m => ({
        _id: m.user?._id,
        id: m.user?._id,
        name: m.user?.name,
        email: m.user?.email,
        role: m.user?.role,
        memberRole: m.role,
        joinedAt: m.joinedAt
      }))
    };

    res.json(formattedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getProjects, getProject, createProject, updateProject, deleteProject, addMember };
