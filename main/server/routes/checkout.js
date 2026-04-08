const express = require("express");

const router = express.Router();

/**
 * Payment gateway routes — intentionally disabled.
 * These endpoints will be wired to a payment provider in a future release.
 * The route structure is preserved so integration is drop-in when ready.
 */
router.post("/create-payment-intent", (_req, res) => {
  res.status(503).json({
    error: "Payment gateway not yet configured. Coming soon.",
  });
});

router.post("/webhook", express.raw({ type: "application/json" }), (_req, res) => {
  res.status(503).json({ error: "Webhook endpoint not yet configured." });
});

module.exports = router;
