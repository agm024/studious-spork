const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const pool = require("../db");

const router = express.Router();

// Rate limit: max 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── SIGN UP ───────────────────────────────────────────────────────────────────
router.post(
  "/signup",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters.")
      .escape(),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check for existing user
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }
);

// ─── SIGN IN ───────────────────────────────────────────────────────────────────
router.post(
  "/signin",
  loginLimiter,
  [
    body("email").trim().isEmail().withMessage("Valid email required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    // Constant-time comparison to prevent timing attacks
    const dummyHash = "$2a$12$invalidhashfortimingprotection0000000000000000000000";
    const passwordToCheck = user ? user.password : dummyHash;
    const match = await bcrypt.compare(password, passwordToCheck);

    if (!user || !match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }
);

// ─── GET CURRENT USER ──────────────────────────────────────────────────────────
const requireAuth = require("../middleware/auth");

router.get("/me", requireAuth, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({ user: result.rows[0] });
});

module.exports = router;
