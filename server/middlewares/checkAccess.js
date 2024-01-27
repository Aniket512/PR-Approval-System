const Role = require("../models/Role");

const checkAccess = (allowedRoles) => {
  return async (req, res, next) => {
    const userRoleIds = req.user.roles;

    try {
      const userRoles = await Role.find({ _id: { $in: userRoleIds } }).select('roleName');

      const userRoleNames = userRoles.map(role => role.roleName);
      const isAuthorized = allowedRoles.some((roleName) => userRoleNames.includes(roleName));

      if (isAuthorized) {
        next();
      } else {
        res.status(403).json({ message: 'You are not autorized to access this route' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = {
  checkAccess,
};
