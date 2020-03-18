require("dotenv").config();
import dialogflow from "dialogflow";
import messagesHelper from "../helpers/messages.helper";

const config = {
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
  }
};

const sessionClient = new dialogflow.SessionsClient(config);

const sendToDialogFlow = async (sender, textString, params) => {
  messagesHelper.sendTypingOn(sender);

  const sessionPath = sessionClient.sessionPath(
    process.env.DIALOGFLOW_PROJECT_ID,
    messagesHelper.sessionIds.get(sender)
  );

  try {
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textString,
          languageCode: process.env.DIALOGFLOW_LANGUAGE_CODE
        }
      },
      queryParams: {
        payload: {
          data: params
        }
      }
    };
    const responses = await sessionClient.detectIntent(request);

    const result = responses[0].queryResult;
    //console.log("result:", result);
    messagesHelper.handleDialogFlowResponse(sender, result);
  } catch (e) {
    console.log("❌ [BOT CONSILIO] Error in process message in Dialogflow:");
    console.log(e);
  }
};

function handleQuickReply(senderID, quickReply, messageId) {
  var quickReplyPayload = quickReply.payload;
  console.log(
    "⚡️ [BOT CONSILIO] Quick reply for message %s with payload %s",
    messageId,
    quickReplyPayload
  );
  //send payload to api.ai
  sendToDialogFlow(senderID, quickReplyPayload);
}

const receivedMessage = event => {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  messagesHelper.setSessionandUser(senderID);
  console.log(
    "Received message for user %d and page %d at %d with message:",
    senderID,
    recipientID,
    timeOfMessage
  );
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    handleEcho(messageId, appId, metadata);
    return;
  } else if (quickReply) {
    handleQuickReply(senderID, quickReply, messageId);
    return;
  }

  if (messageText) {
    sendToDialogFlow(senderID, messageText);
  } else if (messageAttachments) {
    messagesHelper.handleMessageAttachments(messageAttachments, senderID);
  }
};

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  messagesHelper.setSessionandUser(senderID);

  var payload = event.postback.payload;

  switch (payload) {
    case "FACEBOOK_WELCOME":
    case "GET_STARTED_PAYLOAD":
    case "GET_STARTED":
      sendTypingOn(senderID);
      setTimeout(function() {
        let quickReplies = [
          {
            content_type: "text",
            payload: "book-table",
            title: "Book a Table"
          },
          {
            content_type: "text",
            title: "Menu",
            payload: "menu"
          }
        ];
        messagesHelper.sendQuickReply(
          senderID,
          "What would you like to do next?",
          quickReplies
        );
      }, 3000);
      messagesHelper.greetUserText(senderID);
      break;
    case "CHAT":
      messagesHelper.sendTextMessage(
        senderID,
        "I love chatting too. Do you have any other questions for me?"
      );
      break;
    default:
      messagesHelper.sendTextMessage(
        senderID,
        "I'm not sure what you want. Can you be more specific?"
      );
      break;
  }

  console.log(
    "Received postback for user %d and page %d with payload '%s' " + "at %d",
    senderID,
    recipientID,
    payload,
    timeOfPostback
  );
}

function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log(
    "Received message read event for watermark %d and sequence " + "number %d",
    watermark,
    sequenceNumber
  );
}

function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  var passThroughParam = event.optin.ref;

  console.log(
    "Received authentication for user %d and page %d with pass " +
      "through param '%s' at %d",
    senderID,
    recipientID,
    passThroughParam,
    timeOfAuth
  );
  messagesHelper.sendTextMessage(senderID, "Authentication successful");
}

function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log(
    "Received account link event with for user %d with status %s " +
      "and auth code %s ",
    senderID,
    status,
    authCode
  );
}

function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log(
        "Received delivery confirmation for message ID: %s",
        messageID
      );
    });
  }

  console.log("All message before %d were delivered.", watermark);
}

export default {
  sendToDialogFlow,
  receivedMessage,
  receivedPostback,
  receivedMessageRead,
  receivedAuthentication,
  receivedAccountLink,
  receivedDeliveryConfirmation
};
