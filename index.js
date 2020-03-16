"use strict";

require("dotenv").config();

const express = require("express"),
  bodyParser = require("body-parser"),
  port = process.env.PORT || 3000,
  app = express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () =>
  console.log(
    `⚡️[BOT CONSILIO] Express server is listening on port %d in %s mode`,
    server.address().port,
    app.settings.env
  )
);

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.VERIFYTOKEN) {
      console.log("⚡️[BOT CONSILIO] Verify token passed.");
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    res.status(200).send("EVENT_RECEIVED");
    body.entry.forEach(function(entry) {
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);
      handle.handleMessage(webhookEvent);
    });
  } else {
    console.log("⚡️[BOT CONSILIO] You do not have pemissions.");
    res.sendStatus(404);
  }
});

app.get("/", (req, res) => {
  res.send("⚡️[BOT CONSILIO] Hello world!");
});
