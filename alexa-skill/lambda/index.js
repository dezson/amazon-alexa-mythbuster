const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside LaunchRequestHandler");
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(welcomeMessage).reprompt(helpMessage).getResponse();
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

const welcomeMessage = `Welcome to the Mythbuster Game! You can ask me to start a quiz, \
then you are going to have  10 myths from the well known Mythbuster series and you have to \
decide the myths are whether confirmed or busted.`;

const helpMessage = `You can test your mythbuster ability by asking me to start a quiz.`;

const exitSkillMessage = `Goodbye!`;

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopPauseIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
