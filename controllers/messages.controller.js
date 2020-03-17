const fetch = require("node-fetch");
const dialogflow = require("dialogflow");
const uuid = require("uuid");

const config = {
    credentials: {
      private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    }
  },
  projectID = process.env.DIALOGFLOW_PROJECT_ID,
  sessionID = uuid.v4();

const sessionClient = new dialogflow.SessionsClient(config),
  sessionPath = sessionClient.sessionPath(projectID, sessionID);

const sendTextMessage = async (userId, text) => {
  try {
    return fetch(
      `https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
      {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          messaging_type: "RESPONSE",
          recipient: {
            id: userId
          },
          message: {
            text
          }
        })
      }
    );
  } catch (error) {
    console.log("⚡️[BOT CONSILIO] Error in sendTextMessage. ", error);
  }
};

const processMessage = async webhook_event => {
  try {
    const userId = webhook_event.sender.id;
    const message = webhook_event.message.text;

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: process.env.DIALOGFLOW_LANGUAGE_CODE
        }
      }
    };

    console.log("request", request);
    console.log("changed everything to async");
    const responses = await sessionClient.detectIntent(request);
    console.log("responses", responses);
    const result = responses[0].queryResult;
    console.log("result", result);
    return sendTextMessage(userId, result.fulfillmentText);
  } catch (error) {
    console.log(
      "⚡️[BOT CONSILIO] Error in process message in Dialogflow.",
      error
    );
  }
};

module.exports = {
  processMessage
};
