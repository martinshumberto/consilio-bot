"use strict";
import request from "request";
import config from "../config/variables";

export default {
  sendCall: function(callback) {
    request(
      {
        uri: `${config.mPlatfom}/me/messages`,
        qs: {
          access_token: config.PAGE_ACCESS_TOKEN
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
