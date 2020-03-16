"use strict";
module.exports = function(app) {
  const webhookController = require("./controllers/webhook.controller");

  app.route("/webhook").get(webhookController.verifyWebhook);
};
