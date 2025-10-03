const Joi = require("joi");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken } = require("../utils/token");
const sendEmail = require("../utils/mailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().integer().min(10).max(120).optional(),
  weight: Joi.number().min(20).max(500).optional(),
  height: Joi.number().min(50).max(250).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

function convertFtInToCm(ftIn) {
  const match = /^(\d{1,2})'(\d{1,2})$/.exec(ftIn);
  if (!match) return null;
  const feet = parseInt(match[1], 10);
  const inches = parseInt(match[2], 10);
  return Math.round((feet * 12 + inches) * 2.54);
}

const Preferences = require("../models/Preferences");

exports.register = async (req, res) => {
  try {
    const { name, email, password, age, weight, height } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      age,
      weight,
      height,
    });
    await user.save();

    // Create default Preferences for this user
    const preferences = new Preferences({
      userId: user._id,
      // defaults from model will be applied automatically
    });
    await preferences.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    // authMiddleware will attach user to req.user
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
  <div style="font-family: Geist, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2c3e50;">Password Reset Request</h2>
    <p>Hello ${user.name || ""},</p>
    <p>We received a request to reset the password for your account. Click the button below to reset it. This link will expire in <strong>1 hour</strong>.</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="${resetLink}" 
         style="background-color: #000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
    </div>

    <p>If you did not request a password reset, you can safely ignore this email.</p>

    <p style="font-size: 0.9em; color: #777;">Thank you,<br />Thryve Team</p>
  </div>
`;

    console.log("Sending email to:", user.email); // <-- check here
    await sendEmail(user.email, "Password Reset", html);

    res.json({ message: "Check your email for reset link" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Clear the reset token and expiry
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
