const verifyWebHook = async (req, res, next) => {
  try {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];

    if (mode && token) {
      if (mode === "subscribe" && token === process.env.VERIFYTOKEN) {
        console.log("⚡️[BOT CONSILIO] Verify token passed.");
        res.status(200).send(challenge);
      } else {
        console.log("⚡️[BOT CONSILIO] Webhook is not verified.");
        res.status(403);
      }
    }
  } catch (error) {
    console.log("⚡️[BOT CONSILIO] Error in verify webhook ", error);
  }
};

module.exports = {
  verifyWebhook
};
