import messagesController from "./messages.controller";

const verifyWebhook = async (req, res, next) => {
  try {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];

    if (mode && token) {
      if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        console.log("⚡️ [BOT CONSILIO] Verify token passed.");
        res.status(200).send(challenge);
      } else {
        console.log("❌ [BOT CONSILIO] Webhook is not verified.");
        res.status(403);
      }
    }
  } catch (error) {
    console.log("❌ [BOT CONSILIO] Error in verify webhook ", error);
  }
};

const messageHandler = async (req, res, next) => {
  try {
    let body = req.body;

    if (body.object === "page") {
      body.entry.forEach(function(pageEntry) {
        var pageID = pageEntry.id;
        var timeOfEvent = pageEntry.time;

        pageEntry.messaging.forEach(function(messagingEvent) {
          if (messagingEvent.optin) {
            messagesController.receivedAuthentication(messagingEvent);
          } else if (messagingEvent.message) {
            messagesController.receivedMessage(messagingEvent);
          } else if (messagingEvent.delivery) {
            messagesController.receivedDeliveryConfirmation(messagingEvent);
          } else if (messagingEvent.postback) {
            messagesController.receivedPostback(messagingEvent);
          } else if (messagingEvent.read) {
            messagesController.receivedMessageRead(messagingEvent);
          } else if (messagingEvent.account_linking) {
            messagesController.receivedAccountLink(messagingEvent);
          } else {
            console.log(
              "Webhook received unknown messagingEvent: ",
              messagingEvent
            );
          }
        });
      });

      res.status(200).send("⚡️ [BOT CONSILIO] Event receiving.");
    }
  } catch (error) {
    console.log("❌ [BOT CONSILIO] Error in post webhook. ", error);
  }
};

export default { verifyWebhook, messageHandler };
