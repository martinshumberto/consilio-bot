"use strict";
module.exports = function(app) {
  const webhookController = require("../controllers/webhook.controller");
  const handlerController = require("../controllers/handler.controller");

  app.route("/webhook").get(webhookController.verifyWebhook);
  app.route("/webhook").post(handlerController.messageHandler);
};
