require("dotenv").config();
const uuid = require("uuid");
import userService from "../services/user.service";
import messageService from "../services/message.service";
import { struct } from "pb-util";

/**
 * Send action typing on using the Service API.
 * @param {*} recipientId
 */
function sendTypingOn(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  messageService.sendCall(messageData);
}

/**
 * Send action typing off using the Service API.
 * @param {*} recipientId
 */
function sendTypingOff(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  messageService.sendCall(messageData);
}

/**
 * Send type text message using the Service API.
 * @param {*} recipientId
 * @param {*} text
 */
function sendTextMessage(recipientId, text) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text
    }
  };
  messageService.sendCall(messageData);
}

/**
 * Send type quick reply message using the Service API.
 * @param {*} recipientId
 * @param {*} text
 */
function sendQuickReply(recipientId, text, replies, metadata) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text,
      metadata: isDefined(metadata) ? metadata : "",
      quick_replies: replies
    }
  };

  messageService.sendCall(messageData);
}

/**
 * Send type template generic message using the Service API.
 * @param {*} recipientId
 * @param {*} elements
 */
function sendGenericMessage(recipientId, elements) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
        }
      }
    }
  };
  messageService.sendCall(messageData);
}

/**
 * Process message type card
 * @param {*} messages
 * @param {*} sender
 */
function handleCardMessages(messages, sender) {
  let elements = [];
  for (var m = 0; m < messages.length; m++) {
    let message = messages[m];

    let buttons = [];
    for (var b = 0; b < message.card.buttons.length; b++) {
      let isLink = message.card.buttons[b].postback.substring(0, 4) === "http";
      let button;
      if (isLink) {
        button = {
          type: "web_url",
          title: message.card.buttons[b].text,
          url: message.card.buttons[b].postback
        };
      } else {
        button = {
          type: "postback",
          title: message.card.buttons[b].text,
          payload: message.card.buttons[b].postback
        };
      }
      buttons.push(button);
    }

    let element = {
      title: message.card.title,
      image_url: message.card.imageUri,
      subtitle: message.card.subtitle,
      buttons: buttons
    };
    elements.push(element);
  }
  sendGenericMessage(sender, elements);
}

/**
 * Process messages
 * @param {*} messages
 * @param {*} sender
 */
function handleMessages(messages, sender) {
  let timeoutInterval = 1100;
  let previousType;
  let cardTypes = [];
  let timeout = 0;
  for (var i = 0; i < messages.length; i++) {
    if (
      previousType == "card" &&
      (messages[i].message != "card" || i == messages.length - 1)
    ) {
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
      timeout = i * timeoutInterval;
      setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    } else if (messages[i].message == "card" && i == messages.length - 1) {
      cardTypes.push(messages[i]);
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
    } else if (messages[i].message == "card") {
      cardTypes.push(messages[i]);
    } else {
      timeout = i * timeoutInterval;
      setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    }

    previousType = messages[i].message;
  }
}

/**
 * Process single message
 * @param {*} message
 * @param {*} sender
 */
function handleMessage(message, sender) {
  console.log("MESSAGE: ", message);
  switch (message.message) {
    case "text": //text
      message.text.text.forEach(text => {
        if (text !== "") {
          sendTextMessage(sender, text);
        }
      });
      break;
    case "quickReplies": //quick replies
      let replies = [];
      message.quickReplies.quickReplies.forEach(text => {
        let reply = {
          content_type: "text",
          title: text,
          payload: text
        };
        replies.push(reply);
      });
      sendQuickReply(sender, message.quickReplies.title, replies);
      break;
    case "image": //image
      sendImageMessage(sender, message.image.imageUri);
      break;
    case "payload": //payload
      const payload = struct.decode(message.payload);

      let messageData = {
        recipient: {
          id: sender
        },
        message: payload.facebook
      };
      messageService.sendCall(messageData);
      break;
  }
}

/**
 * Process attachments
 * @param {*} messageAttachments
 * @param {*} senderID
 */
function handleMessageAttachments(messageAttachments, senderID) {
  sendTextMessage(senderID, "Anexo recebido. Obrigado.");
}

/**
 * Process Dialogflow response
 * @param {*} sender
 * @param {*} response
 */
function handleDialogFlowResponse(sender, response) {
  let responseText = response.fulfillmentMessages.fulfillmentText;

  let messages = response.fulfillmentMessages;
  let action = response.action;
  let contexts = response.outputContexts;
  let parameters = response.parameters;

  var delay = 4000;

  if (isDefined(action)) {
    sendTypingOn(sender);
    setTimeout(function() {
      sendTypingOff(sender);
      handleDialogFlowAction(sender, action, messages, contexts, parameters);
    }, delay);
  } else if (
    isDefined(messages) &&
    ((messages.length == 1 && messages[0].type != 0) || messages.length > 1)
  ) {
    sendTypingOn(sender);
    setTimeout(function() {
      sendTypingOff(sender);
      handleMessages(messages, sender);
    }, delay);
  } else if (responseText == "" && !isDefined(action)) {
    sendTypingOn(sender);
    setTimeout(function() {
      sendTypingOff(sender);
      sendTextMessage(
        sender,
        "Não tenho certeza do que você quer. Você pode ser mais específico?"
      );
    }, delay);
  } else if (isDefined(responseText)) {
    sendTypingOn(sender);
    setTimeout(function() {
      sendTypingOff(sender);
      sendTextMessage(sender, responseText);
    }, delay);
  }
}

/**
 * Process Dialogflow actions
 * @param {*} sender
 * @param {*} action
 * @param {*} messages
 * @param {*} contexts
 * @param {*} parameters
 */
function handleDialogFlowAction(
  sender,
  action,
  messages,
  contexts,
  parameters
) {
  switch (action) {
    case "input.welcome":
      let user = usersMap.get(sender);
      sendTypingOn(sender);
      sendTextMessage(sender, "Olá " + user.first_name + "!");
      setTimeout(function() {
        handleMessages(messages, sender);
      }, 1000);
      break;

    default:
      handleMessages(messages, sender);
  }
}

/**
 * Just logging message echoes to console
 * @param {*} messageId
 * @param {*} appId
 * @param {*} metadata
 */
function handleEcho(messageId, appId, metadata) {
  console.log(
    "❌ [BOT CONSILIO] Received echo for message %s and app %d with metadata %s",
    messageId,
    appId,
    metadata
  );
}

/**
 * Define is undefined
 * @param {*} obj
 */
function isDefined(obj) {
  if (typeof obj == "undefined") {
    return false;
  }
  if (!obj) {
    return false;
  }
  return obj != null;
}

/**
 * Set userid
 * @param {*} senderID
 */
const sessionIds = new Map();
const usersMap = new Map();

function setSessionandUser(senderID) {
  if (!sessionIds.has(senderID)) {
    sessionIds.set(senderID, uuid.v4());
  }
  if (!usersMap.has(senderID)) {
    userService.addUser(function(user) {
      usersMap.set(senderID, user);
    }, senderID);
  }
}

export default {
  sendTypingOn,
  sendTypingOff,
  sendTextMessage,
  sendQuickReply,
  sendGenericMessage,
  handleCardMessages,
  handleMessages,
  handleDialogFlowResponse,
  handleDialogFlowAction,
  handleMessageAttachments,
  handleEcho,
  setSessionandUser,
  sessionIds,
  usersMap
};
