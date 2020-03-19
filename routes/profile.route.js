"use strict";
import profileController from "../controllers/profile.controller";

export default function(app) {
  app.route("/profile").get(profileController.profileVerify);
}
