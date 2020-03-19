"use strict";

import request from "request";
import config from "../config/variables";

export default {
  callMessengerProfileAPI: function(requestBody) {
    console.log(
      `⚡️ [BOT CONSILIO] Setting Messenger Profile for app ${config.APP_ID}`
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
          console.log("⚡️ [BOT CONSILIO] Request sent:", body);
        } else {
          console.error("❌ [BOT CONSILIO] Unable to send message:", error);
        }
      }
    );
  },
  getUserProfile: async function(senderPsid) {
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
  },
  callUserProfileAPI: function(senderPsid) {
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
          console.error("Unable to fetch profile:" + error);
          reject(Error("Network Error"));
        })
        .on("end", () => {
          body = Buffer.concat(body).toString();
          // console.log(JSON.parse(body));

          resolve(JSON.parse(body));
        });
    });
  },
  getPersonaAPI: function() {
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
  },
  postPersonaAPI: function(name, profile_picture_url) {
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
          // console.log(response.statusCode);
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
      console.error(
        "❌ [BOT CONSILIO] Unable to create a persona:",
        error,
        body
      );
    });
  },
  callNLPConfigsAPI: function() {
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
          console.log("⚡️ [BOT CONSILIO] Request sent:", body);
        } else {
          console.error(
            "❌ [BOT CONSILIO] Unable to activate built-in NLP:",
            error
          );
        }
      }
    );
  },
  callFBAEventsAPI: function(senderPsid, eventName) {
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
        uri: `${config.mPlatfom}/${config.appId}/activities`,
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
  }
};
