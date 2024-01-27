const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const getRoleNamesByIds = async (roleIds) => {
  try {
    const roles = await Role.find({ _id: { $in: roleIds } }, "roleName");
    return roles.map((role) => role.roleName);
  } catch (error) {
    console.error("Error getting role names:", error);
    throw error;
  }
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    if (!username || !email || !password || !roles || roles.length === 0) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingRoles = await Role.find({ roleName: { $in: roles } });

    const roless = await Role.find({});
    console.log(roless);
    if (existingRoles.length !== roles.length) {
      const missingRoles = roles.filter(
        (role) =>
          !existingRoles.some((existingRole) => existingRole.roleName === role)
      );
      return res
        .status(400)
        .json({ message: `Roles not found: ${missingRoles.join(", ")}` });
    }

    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      roles: existingRoles.map((role) => role._id),
    });

    const access_token = signToken(newUser._id);

    res.status(201).json({
      access_token,
      _id: newUser._id,
      email,
      username,
      roles,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res
        .status(409)
        .json({ message: `${duplicateField} already exists.` });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const access_token = signToken(user._id);

    const { _id, email } = user;

    const roleNames = await getRoleNamesByIds(user.roles);

    res.status(200).json({
      access_token,
      _id,
      email,
      username,
      roles: roleNames,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
