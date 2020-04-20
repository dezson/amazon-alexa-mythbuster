const Alexa = require("ask-sdk-core");
const httpGet = require("./get_http.js");
const resourceURL = require("./secret.js");

/* INTENT HANDLERS */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside LaunchRequestHandler");
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(welcomeMessage).reprompt(helpMessage).getResponse();
  },
};

const StartHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log("Inside StartHandler");
    console.log(JSON.stringify(request));
    return (
      request.type === "IntentRequest" &&
      (request.intent.name === "StartIntent" || request.intent.name === "AMAZON.StartOverIntent")
    );
  },
  async handle(handlerInput) {
    console.log("Inside StartHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;
    attributes.counter = 0;
    attributes.score = 0;

    var statement = await getMyth(handlerInput);
    var speakOutput = statement;
    var repromptOutput = statement;

    return response.speak(speakOutput).reprompt(repromptOutput).getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    console.log("Inside HelpIntentHandler");
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    console.log("Inside HelpIntentHandler - handle");
    return handlerInput.responseBuilder.speak(helpMessage).reprompt(helpMessage).getResponse();
  },
};

const CancelAndStopPauseIntentHandler = {
  canHandle(handlerInput) {
    console.log("Inside CancelAndStopPauseIntentHandler");
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.StopIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.PauseIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(exitSkillMessage).getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

/* CONSTANTS */
const welcomeMessage = `Welcome to the Mythbuster Game! You can ask me to start the game, \
then you are going to have  10 myths from the well known Mythbuster series and you have to \
decide the myths are whether confirmed or busted.`;
const helpMessage = "You can test your mythbuster skill by asking me to start the game.";
const exitSkillMessage = "Goodbye!";

/* HELPER FUNCTIONS */
async function getMyth(handlerInput) {
  const mythItem = await httpGet(resourceURL);

  const attributes = handlerInput.attributesManager.getSessionAttributes();
  attributes.mythItem = mythItem;
  attributes.counter += 1;
  handlerInput.attributesManager.setSessionAttributes(attributes);
  return questionBuilder(attributes.counter, mythItem);
}

function questionBuilder(counter, item) {
  return `Here is your ${counter}th question. ${item.Statement}. What do you think, is it CONFIRMED or PLAUSIBLE?`;
}

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    // StartHandler,
    CancelAndStopPauseIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
