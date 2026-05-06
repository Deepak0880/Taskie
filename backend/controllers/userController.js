import User from '../models/User.js';

// @desc    Get all users (for assignee dropdown, member selection)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search users by email
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email query is required' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' }
    }).select('name email role').limit(10);

    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getUsers, searchUsers, getUserById };
