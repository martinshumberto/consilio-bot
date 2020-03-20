"use strict";

require("dotenv").config();

const ENV_VARS = [
  "PORT",
  "PAGE_ID",
  "APP_ID",
  "PAGE_ACCESS_TOKEN",
  "VERIFY_TOKEN",
  "DIALOGFLOW_CLIENT_EMAIL",
  "DIALOGFLOW_PROJECT_ID",
  "DIALOGFLOW_LANGUAGE_CODE",
  "DIALOGFLOW_PRIVATE_KEY",
  "PERSONA_BILLING",
  "PERSONA_COMMERCIAL",
  "PERSONA_SUPPORT"
];

export default {
  mPlatformDomain: "https://graph.facebook.com",
  mPlatformVersion: "v3.2",

  PORT: process.env.PORT || 3000,
  PAGE_ID: process.env.PAGE_ID,
  APP_ID: process.env.APP_ID,
  APP_SECRET: process.env.APP_SECRET,
  PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN,
  VERIFY_TOKEN: process.env.VERIFY_TOKEN,
  DIALOGFLOW_CLIENT_EMAIL: process.env.DIALOGFLOW_CLIENT_EMAIL,
  DIALOGFLOW_PROJECT_ID: process.env.DIALOGFLOW_PROJECT_ID,
  DIALOGFLOW_LANGUAGE_CODE: process.env.DIALOGFLOW_LANGUAGE_CODE,
  DIALOGFLOW_PRIVATE_KEY: process.env.DIALOGFLOW_PRIVATE_KEY,

  APP_URL: process.env.APP_URL,
  SITE_URL: process.env.SITE_URL,

  PERSONAS: {},

  get mPlatfom() {
    return this.mPlatformDomain + "/" + this.mPlatformVersion;
  },

  get webhookUrl() {
    return this.APP_URL + "/webhook";
  },

  get newPersonas() {
    return [
      {
        name: "Humberto Martins",
        picture: `${this.APP_URL}/personas/humberto.png`
      },
      {
        name: "Paulo Savanas",
        picture: `${this.APP_URL}/personas/paulo.png`
      },
      {
        name: "Gabriel Verde",
        picture: `${this.APP_URL}/personas/gabriel.png`
      }
    ];
  },

  pushPersona(persona) {
    this.PERSONAS[persona.name] = persona.id;
  },

  get personaBilling() {
    let id = this.PERSONAS["Humberto Martins"] || process.env.PERSONA_BILLING;
    return {
      name: "Humberto Martins",
      id: id
    };
  },

  get personaCommercial() {
    let id = this.PERSONAS["Paulo Savanas"] || process.env.PERSONA_COMMERCIAL;
    return {
      name: "Paulo Savanas",
      id: id
    };
  },

  get personaSupport() {
    let id = this.PERSONAS["Gabriel Verde"] || process.env.PERSONA_SUPPORT;
    return {
      name: "Gabriel Verde",
      id: id
    };
  },

  get whitelistedDomains() {
    return [this.APP_URL, this.SITE_URL];
  },

  checkEnv: function() {
    ENV_VARS.forEach(function(key) {
      if (!process.env[key]) {
        console.log(
          "❌ [BOT CONSILIO] WARNING: Missing the environment variable " + key
        );
      } else {
        if (["APP_URL", "SITE_URL"].includes(key)) {
          const url = process.env[key];
          if (!url.startsWith("https://")) {
            console.log(
              "❌ [BOT CONSILIO] WARNING: Your " +
                key +
                ' does not begin with "https://"'
            );
          }
        }
      }
    });
  }
};
