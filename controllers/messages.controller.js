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

/**
 * Send all messages to DialogFlow
 * @param {*} sender
 * @param {*} textString
 * @param {*} params
 */
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

/**
 * Process quick reply message
 * @param {*} senderID
 * @param {*} quickReply
 * @param {*} messageId
 */
function handleQuickReply(senderID, quickReply, messageId) {
  var quickReplyPayload = quickReply.payload;
  console.log(
    "⚡️ [BOT CONSILIO] Quick reply for message %s with payload %s",
    messageId,
    quickReplyPayload
  );

  sendToDialogFlow(senderID, quickReplyPayload);
}

/**
 * Received message
 * @param {*} event
 */
const receivedMessage = event => {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  messagesHelper.setSessionandUser(senderID);
  console.log(
    "⚡️ [BOT CONSILIO] Received message for user %d and page %d at %d with message:",
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

/**
 * Received post back
 * @param {*} event
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;

  switch (payload) {
    default:
      messagesHelper.sendTextMessage(
        senderID,
        "Não tenho certeza do que você quer. Você pode ser mais específico?"
      );
      break;
  }

  console.log(
    "⚡️ [BOT CONSILIO] Received postback for user %d and page %d with payload '%s' " +
      "at %d",
    senderID,
    recipientID,
    payload,
    timeOfPostback
  );
}

/**
 * Received notification message read
 * @param {*} event
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log(
    "⚡️ [BOT CONSILIO] Received message read event for watermark %d and sequence " +
      "number %d",
    watermark,
    sequenceNumber
  );
}

/**
 * Received notification authentication
 * @param {*} event
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  var passThroughParam = event.optin.ref;

  console.log(
    "⚡️ [BOT CONSILIO] Received authentication for user %d and page %d with pass " +
      "through param '%s' at %d",
    senderID,
    recipientID,
    passThroughParam,
    timeOfAuth
  );
  messagesHelper.sendTextMessage(
    senderID,
    "Autenticação realizada com sucesso!"
  );
}

/**
 * Received account link
 * @param {*} event
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log(
    "⚡️ [BOT CONSILIO] Received account link event with for user %d with status %s " +
      "and auth code %s ",
    senderID,
    status,
    authCode
  );
}

/**
 * Received devivery confirmation
 * @param {*} event
 */
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
        "⚡️ [BOT CONSILIO] Received delivery confirmation for message ID: %s",
        messageID
      );
    });
  }
  console.log(
    "⚡️ [BOT CONSILIO] All message before %d were delivered.",
    watermark
  );
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
