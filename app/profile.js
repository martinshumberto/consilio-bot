import config from "../config/variables";
import graphApi from "./graph-api";

export default {
  setPersonas() {
    let newPersonas = config.newPersonas;

    graphApi
      .getPersonaAPI()
      .then(personas => {
        for (let persona of personas) {
          config.pushPersona({
            name: persona.name,
            id: persona.id
          });
        }
        return config.PERSONAS;
      })
      .then(existingPersonas => {
        for (let persona of newPersonas) {
          if (!(persona.name in existingPersonas)) {
            graphApi
              .postPersonaAPI(persona.name, persona.picture)
              .then(personaId => {
                config.pushPersona({
                  name: persona.name,
                  id: personaId
                });
              })
              .catch(error => {
                console.log("❌ [BOT CONSILIO] Creation failed:", error);
              });
          } else {
            console.log(
              "⚠️  [BOT CONSILIO] Persona already exists for name:",
              persona.name
            );
          }
        }
      })
      .catch(error => {
        console.log("❌ [BOT CONSILIO] Creation failed:", error);
      });
  },

  setWebhook() {
    graphApi.callSubscriptionsAPI();
    graphApi.callSubscribedApps();
  },

  setPageFeedWebhook() {
    graphApi.callSubscriptionsAPI("feed");
    graphApi.callSubscribedApps("feed");
  },

  setThread() {
    let profilePayload = {
      ...this.getGreeting(),
      ...this.getPersistentMenu()
    };

    graphApi.callMessengerProfileAPI(profilePayload);
  },

  getGreeting() {
    let greetings = [];
    greetings.push(this.getGreetingText());

    return {
      greeting: greetings
    };
  },

  getPersistentMenu() {
    let menuItems = [];

    menuItems.push(this.getMenuItems());

    return {
      persistent_menu: menuItems
    };
  },

  getGreetingText() {
    let localizedGreeting = {
      locale: "default",
      text:
        "Oi {{user_first_name}}! Clique em COMEÇAR para saber como nós da Consilio podemos ajudar a sua empresa a crescer!👇"
    };

    return localizedGreeting;
  },

  getMenuItems() {
    let localizedMenu = {
      locale: "default",
      composer_input_disabled: false,
      call_to_actions: [
        {
          title: "Atendimento",
          type: "nested",
          call_to_actions: [
            {
              title: "Comercial",
              type: "postback",
              payload: "Comercial"
            },
            {
              title: "Financeiro",
              type: "postback",
              payload: "Financeiro"
            },
            {
              title: "Suporte",
              type: "postback",
              payload: "Suporte"
            }
          ]
        },
        {
          title: "E-book gratuito",
          type: "postback",
          payload: "CARE_HELP"
        },
        {
          type: "web_url",
          title: "Acessar site",
          url: config.SITE_URL,
          webview_height_ratio: "full"
        }
      ]
    };
    return localizedMenu;
  },

  setWhitelistedDomains() {
    let domainPayload = this.getWhitelistedDomains();
    graphApi.callMessengerProfileAPI(domainPayload);
  },

  getWhitelistedDomains() {
    let whitelistedDomains = {
      whitelisted_domains: config.whitelistedDomains
    };

    return whitelistedDomains;
  }
};
