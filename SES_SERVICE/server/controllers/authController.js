const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { success, created, error, badRequest, unauthorized, notFound } = require('../utils/apiResponse');

/**
 * @desc    Register a new employee
 * @route   POST /api/auth/register
 * @access  Private (super_admin, admin)
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, department } = req.body;

    if (!name || !email || !password) {
      return badRequest(res, 'Name, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return badRequest(res, 'An employee with this email already exists');
    }

    // Only super_admin can create admin/super_admin roles
    if (['super_admin', 'admin'].includes(role)) {
      if (!req.user || req.user.role !== 'super_admin') {
        return unauthorized(res, 'Only super admins can create admin accounts');
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'sales_agent',
      phone,
      department,
    });

    return created(res, { user: user.toPublicJSON() }, 'Employee registered successfully');
  } catch (err) {
    console.error('Register error:', err);
    return error(res, err.message || 'Registration failed');
  }
};

/**
 * @desc    Login employee
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    console.log('📥 Login Request Body:', req.body);
    const { email, password } = req.body;
    console.log(`📥 Login Request: ${email}`);

    if (!email || !password) {
      return badRequest(res, 'Email and password are required');
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`❌ Login attempt failed: User ${email} not found`);
      return unauthorized(res, 'User not found with this email');
    }

    if (!user.isActive) {
      console.log(`❌ Login attempt failed: User ${email} is inactive`);
      return unauthorized(res, 'Your account has been deactivated. Contact an administrator.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`❌ Login attempt failed: Incorrect password for ${email}`);
      return unauthorized(res, 'Invalid password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    return success(res, {
      user: user.toPublicJSON(),
      token,
    }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed');
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return notFound(res, 'User not found');
    }
    return success(res, { user: user.toPublicJSON() });
  } catch (err) {
    return error(res, 'Failed to fetch profile');
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, department } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;
    if (department !== undefined) updates.department = department;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return success(res, { user: user.toPublicJSON() }, 'Profile updated');
  } catch (err) {
    return error(res, 'Failed to update profile');
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return badRequest(res, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return badRequest(res, 'New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return unauthorized(res, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id, user.role);

    return success(res, { token }, 'Password changed successfully');
  } catch (err) {
    return error(res, 'Failed to change password');
  }
};

/**
 * @desc    List all employees (admin view)
 * @route   GET /api/auth/users
 * @access  Private (super_admin, admin)
 */
const getUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return success(res, {
      users: users.map((u) => u.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    return error(res, 'Failed to fetch users');
  }
};

/**
 * @desc    Update an employee (admin action)
 * @route   PUT /api/auth/users/:id
 * @access  Private (super_admin, admin)
 */
const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, department, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return notFound(res, 'User not found');
    }

    // Prevent non-super_admin from modifying super_admin accounts
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return unauthorized(res, 'Cannot modify super admin accounts');
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;

    // Only super_admin can assign admin/super_admin roles
    if (role) {
      if (['super_admin', 'admin'].includes(role) && req.user.role !== 'super_admin') {
        return unauthorized(res, 'Only super admins can assign admin roles');
      }
      user.role = role;
    }

    await user.save({ validateBeforeSave: true });

    return success(res, { user: user.toPublicJSON() }, 'User updated');
  } catch (err) {
    return error(res, err.message || 'Failed to update user');
  }
};

/**
 * @desc    Delete an employee
 * @route   DELETE /api/auth/users/:id
 * @access  Private (super_admin)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return notFound(res, 'User not found');
    }

    if (user.role === 'super_admin') {
      return badRequest(res, 'Cannot delete super admin accounts');
    }

    await User.findByIdAndDelete(req.params.id);

    return success(res, {}, 'User deleted');
  } catch (err) {
    return error(res, 'Failed to delete user');
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getUsers,
  updateUser,
  deleteUser,
};
