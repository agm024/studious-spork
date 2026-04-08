const express = require("express");
const { body, param, validationResult } = require("express-validator");
const pool = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

// ─── GET CART ──────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT product_id, quantity FROM cart_items WHERE user_id = $1 ORDER BY created_at",
    [req.user.id]
  );
  res.json({ items: result.rows });
});

// ─── ADD / UPDATE ITEM ─────────────────────────────────────────────────────────
router.post(
  "/",
  [
    body("productId").isInt({ min: 1 }).withMessage("productId must be a positive integer."),
    body("quantity").optional().isInt({ min: 1, max: 99 }).withMessage("Quantity must be 1–99."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { productId, quantity = 1 } = req.body;

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING product_id, quantity`,
      [req.user.id, productId, quantity]
    );
    res.status(200).json({ item: result.rows[0] });
  }
);

// ─── UPDATE QUANTITY ───────────────────────────────────────────────────────────
router.put(
  "/:productId",
  [
    param("productId").isInt({ min: 1 }),
    body("quantity").isInt({ min: 1, max: 10 }).withMessage("Quantity must be 1–10."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1
       WHERE user_id = $2 AND product_id = $3
       RETURNING product_id, quantity`,
      [quantity, req.user.id, productId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Item not found in cart." });
    }
    res.json({ item: result.rows[0] });
  }
);

// ─── REMOVE ITEM ───────────────────────────────────────────────────────────────
router.delete(
  "/:productId",
  [param("productId").isInt({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    await pool.query(
      "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [req.user.id, req.params.productId]
    );
    res.json({ success: true });
  }
);

// ─── CLEAR CART ────────────────────────────────────────────────────────────────
router.delete("/", async (req, res) => {
  await pool.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);
  res.json({ success: true });
});

module.exports = router;
