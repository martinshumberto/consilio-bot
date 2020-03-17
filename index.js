"use strict";

require("dotenv").config();

const express = require("express"),
  bodyParser = require("body-parser"),
  port = process.env.PORT || 3000,
  cors = require("./config/cors"),
  app = express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(cors);

const webhookRoutes = require("./routes/webhook.route");
webhookRoutes(app);

app.listen(port, () =>
  console.log(
    `⚡️[BOT CONSILIO] Express server is listening on port %d in %s mode.`,
    port,
    app.settings.env
  )
);

app.get("/", (req, res) => {
  res.send("⚡️[BOT CONSILIO] Hello world!");
});
