"use strict";

require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";
import cors from "./config/cors";
import webhookRoutes from "./routes/webhook.route";

if (!process.env.PORT) {
  throw new Error("missing PORT");
}
if (!process.env.PAGE_ID) {
  throw new Error("missing PAGE_ID");
}
if (!process.env.APP_ID) {
  throw new Error("missing APP_ID");
}
if (!process.env.PAGE_ACCESS_TOKEN) {
  throw new Error("missing PAGE_ACCESS_TOKEN");
}
if (!process.env.VERIFY_TOKEN) {
  throw new Error("missing VERIFY_TOKEN");
}
if (!process.env.DIALOGFLOW_CLIENT_EMAIL) {
  throw new Error("missing DIALOGFLOW_CLIENT_EMAIL");
}
if (!process.env.DIALOGFLOW_PROJECT_ID) {
  throw new Error("missing DIALOGFLOW_PROJECT_ID");
}
if (!process.env.DIALOGFLOW_LANGUAGE_CODE) {
  throw new Error("missing DIALOGFLOW_LANGUAGE_CODE");
}

const port = process.env.PORT || 3000,
  app = express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(cors)
    .use(express.static(__dirname + "/static"));

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
