require("dotenv").config();
import request from "request";

export default {
  addUser: function(callback, userId) {
    request(
      {
        uri: "https://graph.facebook.com/v3.2/" + userId,
        qs: {
          access_token: process.env.PAGE_ACCESS_TOKEN
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
