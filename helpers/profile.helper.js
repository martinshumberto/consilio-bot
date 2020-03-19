import config from "../config/variables";
import profileService from "../services/profile.service";

export default {
  setPersonas() {
    let newPersonas = config.newPersonas;

    profileService
      .getPersonaAPI()
      .then(personas => {
        for (let persona of personas) {
          config.pushPersona({
            name: persona.name,
            id: persona.id
          });
        }
        console.log(config.PERSONAS);
        return config.PERSONAS;
      })
      .then(existingPersonas => {
        for (let persona of newPersonas) {
          if (!(persona.name in existingPersonas)) {
            profileService
              .postPersonaAPI(persona.name, persona.picture)
              .then(personaId => {
                config.pushPersona({
                  name: persona.name,
                  id: personaId
                });
                console.log(config.PERSONAS);
              })
              .catch(error => {
                console.log("Creation failed:", error);
              });
          } else {
            console.log("Persona already exists for name:", persona.name);
          }
        }
      })
      .catch(error => {
        console.log("Creation failed:", error);
      });
  },

  setWhitelistedDomains() {
    let domainPayload = this.getWhitelistedDomains();
    profileService.callMessengerProfileAPI(domainPayload);
  },

  getWhitelistedDomains() {
    let whitelistedDomains = {
      whitelisted_domains: config.whitelistedDomains
    };

    console.log(whitelistedDomains);
    return whitelistedDomains;
  }
};
