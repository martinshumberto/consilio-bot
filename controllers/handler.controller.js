const { processMessage } = require("./messages.controller");

const messageHandler = async (req, res, next) => {
  try {
    let body = req.body;
    if (body.object === "page") {
      body.entry.forEach(async entry => {
        let webhook_event = entry.messaging[0];
        processMessage(webhook_event);

        /*   Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log("Sender PSID: " + sender_psid);
        if (webhook_event.message && webhook_event.message.text) {
          let text = webhook_event.message.text.toLowerCase();
          if (text === "start" || text === "add") {
            await addToUser(sender_psid);
          } else if (text === "stop" || text === "remove") {
            await User.deleteOne({ sender: sender_psid });
          }
          sendTextMessage(sender_psid, "intazar kejyea");
        } */
      });
      res.status(200).send("⚡️[BOT CONSILIO] Event receiving.");
    }
  } catch (error) {
    console.log("⚡️[BOT CONSILIO] Error in post webhook. ", error);
  }
};

module.exports = {
  messageHandler
};
