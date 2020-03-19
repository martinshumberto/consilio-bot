import config from "../config/variables";
import profileService from "../services/profile.service";
import profileHelper from "../helpers/profile.helper";

const profileVerify = async (req, res, next) => {
  let token = req.query["verify_token"];
  let mode = req.query["mode"];

  if (!config.APP_URL.startsWith("https://")) {
    res.status(200).send("ERROR - Need a proper API_URL in the .env file");
  }

  if (mode && token) {
    if (token === config.VERIFY_TOKEN) {
      if (mode == "personas" || mode == "all") {
        profileHelper.setPersonas();
        res.write(`<p>Set Personas for ${config.APP_ID}</p>`);
        res.write(
          "<p>To persist the personas, add the following variables \
          to your environment variables:</p>"
        );
        res.write("<ul>");
        res.write(`<li>PERSONA_BILLING = ${config.personaBilling.id}</li>`);
        res.write(
          `<li>PERSONA_COMMERCIAL = ${config.personaCommercial.id}</li>`
        );
        res.write(`<li>PERSONA_SUPPORT = ${config.personaSupport.id}</li>`);
        res.write("</ul>");
      }
      if (mode == "nlp" || mode == "all") {
        profileService.callNLPConfigsAPI();
        res.write(`<p>Enable Built-in NLP for Page ${config.pageId}</p>`);
      }
      if (mode == "domains" || mode == "all") {
        profileHelper.setWhitelistedDomains();
        res.write(`<p>Whitelisting domains: ${config.whitelistedDomains}</p>`);
      }
      res.status(200).end();
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(404);
  }
};

export default {
  profileVerify
};
