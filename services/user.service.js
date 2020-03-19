"use strict";
import request from "request";
import config from "../config/variables";

export default {
  addUser: function(callback, userId) {
    request(
      {
        uri: `${config.mPlatfom}/${userId}`,
        qs: {
          access_token: config.PAGE_ACCESS_TOKEN
        }
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var user = JSON.parse(body);
          if (user.first_name.length > 0) {
            callback(user);
          } else {
            console.log(
              "❌ [BOT CONSILIO] Cannot get data for fb user with id",
              userId
            );
          }
        } else {
          console.error(response.error);
        }
      }
    );
  }
};
