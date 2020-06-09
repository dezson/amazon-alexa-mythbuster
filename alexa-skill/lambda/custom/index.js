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
    return handlerInput.responseBuilder
      .speak(messages.WELCOME)
      .reprompt(messages.HELP)
      .getResponse();
  },
};

const GetNewMythHandler = {
  canHandle(handlerInput) {
    console.log("Inside GetNewMythHandler");
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === "StartIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.StartOverIntent")
    );
  },
  async handle(handlerInput) {
    console.log("Inside GetNewMythHandler - handle");

    const randomFact = await httpGet(resourceURL);
    console.log(`GetNewMythHandler randomFact: ${randomFact}`);

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.mythItem = randomFact;
    handlerInput.attributesManager.setSessionAttributes(attributes);

    const question = questionBuilder(randomFact);
    return handlerInput.responseBuilder.speak(question).reprompt(question).getResponse();
  },
};

const AnswerHandler = {
  canHandle(handlerInput) {
    console.log("Inside AnswerHandler");
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AnswerIntent"
    );
  },
  async handle(handlerInput) {
    console.log("Inside AnswerHandler - handle");
    var speakOutput;
    var repromptOutput;

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const item = attributes.mythItem;
    const isCorrect = compareSlots(handlerInput.requestEnvelope.request.intent.slots, item.answer);

    if (isCorrect) {
      speakOutput = getSpeechCon(true);
    } else {
      speakOutput = getSpeechCon(false);
    }

    speakOutput += getExplanation(item);
    var randomFact = await httpGet(resourceURL);
    attributes.mythItem = randomFact;
    handlerInput.attributesManager.setSessionAttributes(attributes);

    const question = " " + questionBuilder(randomFact);
    speakOutput += question;
    repromptOutput = question;

    return handlerInput.responseBuilder.speak(speakOutput).reprompt(repromptOutput).getResponse();
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
    return handlerInput.responseBuilder.speak(messages.HELP).reprompt(messages.HELP).getResponse();
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
    return handlerInput.responseBuilder.speak(messages.EXIT).getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    console.log("Inside ExitHandler");

    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === `IntentRequest` &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.StopIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.PauseIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.CancelIntent")
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(message.EXIT).getResponse();
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    console.log("Inside RepeatHandler");

    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.RepeatIntent"
    );
  },
  handle(handlerInput) {
    console.log("Inside RepeatHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const mythItem = attributes.mythItem;
    const question = questionBuilder(mythItem);

    return handlerInput.responseBuilder.speak(question).reprompt(question).getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    console.log("Inside ErrorHandler");
    return true;
  },
  handle(handlerInput, error) {
    console.log("Inside ErrorHandler - handle");
    console.log(`Error handled: ${JSON.stringify(error)}`);
    console.log(`Handler Input: ${JSON.stringify(handlerInput)}`);
    return handlerInput.responseBuilder.speak(messages.ERROR).getResponse();
  },
};

/* CONSTANTS */
messages = {
  WELCOME: `Welcome to the Mythbuster Game! You can ask me to start the game, \
    then you are going to have myths from the well known Mythbuster series and you have to \
    decide the myths are whether confirmed or busted.`,
  HELP: "You can test your mythbuster skill by asking me to start the game.",
  EXIT: "Goodbye!",
  ERROR: "Sorry, an error occurred.",
  CORRECT_ANSWER: [
    "Booya",
    "All righty",
    "Bam",
    "Bazinga",
    "Bingo",
    "Boom",
    "Bravo",
    "Cha Ching",
    "Cheers",
    "Dynomite",
    "Hip hip hooray",
    "Hurrah",
    "Hurray",
    "Huzzah",
    "Oh dear.  Just kidding.  Hurray",
    "Kaboom",
    "Kaching",
    "Oh snap",
    "Phew",
    "Righto",
    "Way to go",
    "Well done",
    "Whee",
    "Woo hoo",
    "Yay",
    "Wowza",
    "Yowsa",
  ],
  WRONG_ANSWER: [
    "Argh",
    "Aw man",
    "Blarg",
    "Blast",
    "Boo",
    "Bummer",
    "Darn",
    "D'oh",
    "Dun dun dun",
    "Eek",
    "Honk",
    "Le sigh",
    "Mamma mia",
    "Oh boy",
    "Oh dear",
    "Oof",
    "Ouch",
    "Ruh roh",
    "Shucks",
    "Uh oh",
    "Wah wah",
    "Whoops a daisy",
    "Yikes",
  ],
};

/* HELPER FUNCTIONS */
function questionBuilder(mythObject) {
  return `Here is your question. ${mythObject.statement}. What do you think, is it CONFIRMED or BUSTED?`;
}

function compareSlots(slots, value) {
  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      if (slots[slot].value.toLowerCase() === value.toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getSpeechCon(type) {
  if (type)
    return `<say-as interpret-as='interjection'>${
      messages.CORRECT_ANSWER[getRandom(0, messages.CORRECT_ANSWER.length - 1)]
    }! </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${
    messages.WRONG_ANSWER[getRandom(0, messages.WRONG_ANSWER.length - 1)]
  } !</say-as><break strength='strong'/>`;
}

function getExplanation(item) {
  return item.explanation;
}

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    GetNewMythHandler,
    AnswerHandler,
    RepeatHandler,
    CancelAndStopPauseIntentHandler,
    ExitHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
