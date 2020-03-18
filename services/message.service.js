require("dotenv").config();
import request from "request";

export default {
  sendCall: function(callback, userId) {
    request(
      {
        uri: "https://graph.facebook.com/v3.2/me/messages",
        qs: {
          access_token: process.env.PAGE_ACCESS_TOKEN
        },
        method: "POST",
        json: callback
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          let recipientId = body.recipient_id;
          let messageId = body.message_id;

          if (messageId) {
            console.log(
              "⚡️ [BOT CONSILIO] Successfully sent message with id %s to recipient %s",
              messageId,
              recipientId
            );
          } else {
            console.log(
              "⚡️ [BOT CONSILIO] Successfully called Send API for recipient %s",
              recipientId
            );
          }
        } else {
          console.error(
            "❌ [BOT CONSILIO] Failed calling Send API",
            response.statusCode,
            response.statusMessage,
            body.error
          );
        }
      }
    );
  }
};
