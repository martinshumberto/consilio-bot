"use strict";
import webhookController from "../controllers/webhook.controller";

export default function(app) {
  app.route("/webhook").get(webhookController.verifyWebhook);
  app.route("/webhook").post(webhookController.messageHandler);
}
