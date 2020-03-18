require("dotenv").config();
const uuid = require("uuid");
import request from "request";
import userService from "../services/user.service";
import messageService from "../services/message.service";

function sendTypingOn(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  messageService.sendCall(messageData);
}

function sendTypingOff(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  messageService.sendCall(messageData);
}

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

function handleMessage(message, sender) {
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
  }
}

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
  } else if (isDefined(responseText)) {
    sendTypingOn(sender);
    setTimeout(function() {
      sendTypingOff(sender);
      sendTextMessage(sender, responseText);
    }, delay);
  }
}

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
      }, 500);
      break;

    default:
      handleMessages(messages, sender);
  }
}

function handleEcho(messageId, appId, metadata) {
  // Just logging message echoes to console
  console.log(
    "❌ [BOT CONSILIO] Received echo for message %s and app %d with metadata %s",
    messageId,
    appId,
    metadata
  );
}

let username = "";
function greetUserText(userId) {
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
        console.log("getUserData: " + user);
        if (user.first_name) {
          console.log("FB user: %s %s", user.first_name, user.last_name);
          username = user.first_name + user.last_name;
          sendTextMessage(
            userId,
            "Welcome " +
              user.first_name +
              "! " +
              "I can answer frequently asked questions for you " +
              "What can I help you with?"
          );
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

function handleMessageAttachments(messageAttachments, senderID) {
  sendTextMessage(senderID, "Anexo recebido. Obrigado.");
}

function isDefined(obj) {
  if (typeof obj == "undefined") {
    return false;
  }

  if (!obj) {
    return false;
  }

  return obj != null;
}

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
  handleCardMessages,
  sendGenericMessage,
  handleMessages,
  handleDialogFlowResponse,
  handleDialogFlowAction,
  handleMessageAttachments,
  handleEcho,
  greetUserText,
  setSessionandUser,
  sessionIds,
  usersMap
};
