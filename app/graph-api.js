"use strict";
import request from "request";
import config from "../config/variables";

/**
 * Send call to Facebook Graph API
 * @param {*} callback
 */
const sendCall = callback => {
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
};

const callMessengerProfileAPI = requestBody => {
  console.log(
    `⚡️ [BOT CONSILIO] Setting messenger profile for app ${config.APP_ID}`
  );
  request(
    {
      uri: `${config.mPlatfom}/me/messenger_profile`,
      qs: {
        access_token: config.PAGE_ACCESS_TOKEN
      },
      method: "POST",
      json: requestBody
    },
    (error, _res, body) => {
      if (!error) {
        console.log(
          "⚡️ [BOT CONSILIO] Messenger profile API request sent:",
          body
        );
      } else {
        console.error("❌ [BOT CONSILIO] Unable to send message:", error);
      }
    }
  );
};

const getUserProfile = async senderPsid => {
  try {
    const userProfile = await this.callUserProfileAPI(senderPsid);

    for (const key in userProfile) {
      const camelizedKey = camelCase(key);
      const value = userProfile[key];
      delete userProfile[key];
      userProfile[camelizedKey] = value;
    }

    return userProfile;
  } catch (err) {
    console.log("❌ [BOT CONSILIO] Fetch failed:", err);
  }
};
const callUserProfileAPI = senderPsid => {
  return new Promise(function(resolve, reject) {
    let body = [];

    request({
      uri: `${config.mPlatfom}/${senderPsid}`,
      qs: {
        access_token: config.PAGE_ACCESS_TOKEN,
        fields: "first_name, last_name, gender, locale, timezone"
      },
      method: "GET"
    })
      .on("response", function(response) {
        // console.log(response.statusCode);

        if (response.statusCode !== 200) {
          reject(Error(response.statusCode));
        }
      })
      .on("data", function(chunk) {
        body.push(chunk);
      })
      .on("error", function(error) {
        console.error("❌ [BOT CONSILIO] Unable to fetch profile:" + error);
        reject(Error("❌ [BOT CONSILIO] Network Error"));
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        // console.log(JSON.parse(body));

        resolve(JSON.parse(body));
      });
  });
};
const getPersonaAPI = () => {
  return new Promise(function(resolve, reject) {
    let body = [];

    console.log(
      `⚡️ [BOT CONSILIO] Fetching personas for app ${config.APP_ID}`
    );

    request({
      uri: `${config.mPlatfom}/me/personas`,
      qs: {
        access_token: config.PAGE_ACCESS_TOKEN
      },
      method: "GET"
    })
      .on("response", function(response) {
        // console.log(response.statusCode);

        if (response.statusCode !== 200) {
          reject(Error(response.statusCode));
        }
      })
      .on("data", function(chunk) {
        body.push(chunk);
      })
      .on("error", function(error) {
        console.error("❌ [BOT CONSILIO] Unable to fetch personas:" + error);
        reject(Error("❌ [BOT CONSILIO] Network Error"));
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        // console.log(JSON.parse(body));

        resolve(JSON.parse(body).data);
      });
  });
};
const postPersonaAPI = (name, profile_picture_url) => {
  let body = [];

  return new Promise(function(resolve, reject) {
    console.log(
      `⚡️ [BOT CONSILIO] Creating a Persona for app ${config.APP_ID}`
    );

    let requestBody = {
      name: name,
      profile_picture_url: profile_picture_url
    };

    request({
      uri: `${config.mPlatfom}/me/personas`,
      qs: {
        access_token: config.PAGE_ACCESS_TOKEN
      },
      method: "POST",
      json: requestBody
    })
      .on("response", function(response) {
        //console.log(response.statusCode);
        if (response.statusCode !== 200) {
          reject(Error(response.statusCode));
        }
      })
      .on("data", function(chunk) {
        body.push(chunk);
      })
      .on("error", function(error) {
        console.error("❌ [BOT CONSILIO] Unable to create a persona:", error);
        reject(Error("❌ [BOT CONSILIO] Network Error"));
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        // console.log(JSON.parse(body));

        resolve(JSON.parse(body).id);
      });
  }).catch(error => {
    console.error("❌ [BOT CONSILIO] Unable to create a persona:", error, body);
  });
};
const callNLPConfigsAPI = () => {
  console.log(
    `⚡️ [BOT CONSILIO] Enable Built-in NLP for Page ${config.PAGE_ID}`
  );
  request(
    {
      uri: `${config.mPlatfom}/me/nlp_configs`,
      qs: {
        access_token: config.PAGE_ACCESS_TOKEN,
        nlp_enabled: true
      },
      method: "POST"
    },
    (error, _res, body) => {
      if (!error) {
        console.log("⚡️ [BOT CONSILIO] NLP request sent:", body);
      } else {
        console.error(
          "❌ [BOT CONSILIO] Unable to activate built-in NLP:",
          error
        );
      }
    }
  );
};
const callFBAEventsAPI = (senderPsid, eventName) => {
  // Construct the message body
  let requestBody = {
    event: "CUSTOM_APP_EVENTS",
    custom_events: JSON.stringify([
      {
        _eventName: "postback_payload",
        _value: eventName,
        _origin: "original_coast_clothing"
      }
    ]),
    advertiser_tracking_enabled: 1,
    application_tracking_enabled: 1,
    extinfo: JSON.stringify(["mb1"]),
    page_id: config.pageId,
    page_scoped_user_id: senderPsid
  };
  request(
    {
      uri: `${config.mPlatfom}/${config.APP_ID}/activities`,
      method: "POST",
      form: requestBody
    },
    error => {
      if (!error) {
        console.log(`⚡️ [BOT CONSILIO] FBA event '${eventName}'`);
      } else {
        console.error(
          `❌ [BOT CONSILIO] Unable to send FBA event '${eventName}':` + error
        );
      }
    }
  );
};
const callSubscriptionsAPI = customFields => {
  console.log(
    `⚡️ [BOT CONSILIO] Setting app ${config.APP_ID} callback url to ${config.webhookUrl}`
  );

  let fields =
    "messages, messaging_postbacks, messaging_optins, \
      message_deliveries, messaging_referrals";

  if (customFields !== undefined) {
    fields = fields + ", " + customFields;
  }

  //console.log(fields);

  request(
    {
      uri: `${config.mPlatfom}/${config.APP_ID}/subscriptions`,
      qs: {
        access_token: config.APP_ID + "|" + config.APP_SECRET,
        object: "page",
        callback_url: config.APP_URL + "/webhook",
        verify_token: config.VERIFY_TOKEN,
        fields: fields,
        include_values: "true"
      },
      method: "POST"
    },
    (error, _res, body) => {
      if (!error) {
        console.log("⚡️ [BOT CONSILIO] Request sent:", body);
      } else {
        console.error("❌ [BOT CONSILIO] Unable to send message:", error);
      }
    }
  );
};
const callSubscribedApps = customFields => {
  console.log(
    `⚡️ [BOT CONSILIO] Subscribing app ${config.APP_ID} to page ${config.PAGE_ID}`
  );

  let fields =
    "messages, messaging_postbacks, messaging_optins, \
      message_deliveries, messaging_referrals";

  if (customFields !== undefined) {
    fields = fields + ", " + customFields;
  }
  //messaging_postbacksconsole.log(fields);
  request(
    {
      uri: `${config.mPlatfom}/${config.PAGE_ID}/subscribed_apps`,
      qs: {
        access_token: config.PAGE_ACCESS_TOKEN,
        subscribed_fields: fields
      },
      method: "POST"
    },
    error => {
      if (error) {
        console.error("❌ [BOT CONSILIO] Unable to send message:", error);
      }
    }
  );
};
const addUser = (callback, userId) => {
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
};

export default {
  sendCall,
  callMessengerProfileAPI,
  getUserProfile,
  callUserProfileAPI,
  getPersonaAPI,
  postPersonaAPI,
  callNLPConfigsAPI,
  callFBAEventsAPI,
  callSubscriptionsAPI,
  callSubscribedApps,
  addUser
};
