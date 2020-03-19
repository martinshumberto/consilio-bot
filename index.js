"use strict";

require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";
import cors from "./config/cors";
import webhookRoutes from "./routes/webhook.route";
import request from "request";

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
    `⚡️ [BOT CONSILIO] Express server is listening on port %d in %s mode.`,
    port,
    app.settings.env
  )
);

const URL =
  "https://graph.facebook.com/v2.11/me?fields=id&access_token=" +
  process.env.PAGE_ACCESS_TOKEN;
app.get("/", (req, res) => {
  request(URL, (error, response, body) => {
    const page = JSON.parse(body);
    res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>BOT CONSILIO</title>
            </head>
            <body>
                <div style="font-family: sans-serif;">
                    <h1>BOT MESSENGER INTEGRATE DIALOGFLOW</h1>
                    <ul>
                        <li>Go chat at <a href="https://m.me/${page.id}" target="_blank">m.me/${page.id}</a></li>
                        <li>Webhook URL: https://${req.headers.host}/webhook</li>
                        <li>Verify token: ${process.env.VERIFY_TOKEN}</li>
                    <ul/>
                </div>
            </body>
            </html>`);
  });
});
