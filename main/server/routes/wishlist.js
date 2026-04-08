const express = require("express");
const { body, param, validationResult } = require("express-validator");
const pool = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// ─── GET WISHLIST ──────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT product_id FROM wishlist_items WHERE user_id = $1 ORDER BY created_at",
    [req.user.id]
  );
  res.json({ items: result.rows.map((r) => r.product_id) });
});

// ─── TOGGLE WISHLIST ITEM ──────────────────────────────────────────────────────
router.post(
  "/toggle",
  [body("productId").isInt({ min: 1 }).withMessage("productId must be a positive integer.")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { productId } = req.body;

    // Check if already in wishlist
    const existing = await pool.query(
      "SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2",
      [req.user.id, productId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2",
        [req.user.id, productId]
      );
      return res.json({ action: "removed", productId });
    }

    await pool.query(
      "INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)",
      [req.user.id, productId]
    );
    res.json({ action: "added", productId });
  }
);

// ─── SYNC (replace server wishlist with provided list) ─────────────────────────
router.post(
  "/sync",
  [
    body("productIds")
      .isArray()
      .withMessage("productIds must be an array.")
      .custom((arr) => arr.every((id) => Number.isInteger(id) && id > 0))
      .withMessage("All productIds must be positive integers."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { productIds } = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      // Delete existing wishlist for user
      await client.query("DELETE FROM wishlist_items WHERE user_id = $1", [req.user.id]);

      if (productIds.length > 0) {
        const placeholders = productIds
          .map((_, i) => `(₹1, ₹${i + 2})`)
          .join(", ");
        await client.query(
          `INSERT INTO wishlist_items (user_id, product_id) VALUES ${placeholders}`,
          [req.user.id, ...productIds]
        );
      }
      await client.query("COMMIT");

      const result = await client.query(
        "SELECT product_id FROM wishlist_items WHERE user_id = $1",
        [req.user.id]
      );
      res.json({ items: result.rows.map((r) => r.product_id) });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
);

module.exports = router;
