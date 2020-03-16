const express = require("express");
const webhookController = require("./controllers/webhook.controller");
const router = express.router();

router.get("/webhook", webhookController.verifyWebhook);

module.exports = router;
