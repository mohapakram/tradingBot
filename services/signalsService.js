import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import events from "telegram/events/index.js";
import fs from "fs";
import { JSONPreset } from "lowdb/node";
import { v4 } from "uuid";
import extractData from "../utils/extractData.js";
import checkTemplateStart from "../utils/checkTemplate.js";
import axios from "axios";
import input from "input";
import dotenv from "dotenv";
dotenv.config();

const apiId = 26536993;
const apiHash = "6538bcccfa71573d43080f9688512dc1";

const string = process.env.AUTH_STRING;

const stringSession = new StringSession(string);

const apiKey = process.env.OPEN_API_KEY;

const openAIEndpoint = "https://api.openai.com/v1/chat/completions";

// const requestData = (message) =>   {
//   model: "gpt-4", // You can specify other models as well
//   messages: [
//     { role: "system", content: "You are a helpful assistant." },
//     {
//       role: "user",
//       content: `
//       Please parse the following message and extract key details to format them into a JSON object. The details to extract include the coin name, order type, leverage, entry price range, take profits at different levels, and the stop loss. Here's the message:

// ${message}

// Format the extracted information into JSON as follows:

// {
//   "coinName": [coin name],
//   "orderType": [order type],
//   "leverage": [leverage],
//   "entryPriceStart": [start of entry price range],
//   "entryPriceEnd": [end of entry price range],
//   "takeProfits": [
//     ["1", [first take profit]],
//     ["2", [second take profit]],
//     ["3", [third take profit]],
//     ["4", [fourth take profit]]
//   ],
//   "stopLoss": [stop loss

//     `,
//     },
//   ],
// };

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

const defaultData = {
  signals: [],
};

// const formatData = () => {
//   axios
//     .post(openAIEndpoint, requestData, { headers })
//     .then((response) => {
//       console.log("Response from OpenAI:", response.data);
//     })
//     .catch((error) => {
//       console.error("Error calling OpenAI API:", error);
//     });
// };

const phoneNumbers = ["+201015101083", "+201288109180"];

export const db = await JSONPreset("./db.json", defaultData);

const pullSignals = async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  // Prompt for phone number and authentication
  await client.start({
    phoneNumber: async () =>
      await input.text("Please enter your phone number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the verification code you received: "),
    onError: (err) => console.error(err),
  });

  console.log("You are now logged in.");
  console.log("Your session string:", client.session.save());
  console.log("Connected to telegram!");
  const channelTitle = "🤑UFO Signals F🤑"; // Replace with the target channel title
  const dialogs = await client.getDialogs({});
  const channel = dialogs.find((dialog) => dialog.title === channelTitle);

  if (!channel) {
    console.error("Channel not found");
    return;
  }

  let allMessages = [];
  let minId = 0;

  function appendMessageToFile(message, filePath) {
    fs.appendFileSync(filePath, message + "\n", (err) => {
      if (err) {
        console.error("Failed to append message to file:", err);
      }
    });
  }

  const lastMessages = await client.getMessages(channel, { limit: 500 });
  const msgArr = lastMessages.filter((message) =>
    checkTemplateStart(message.message)
  );

  const formattedArr = msgArr.map((msg) => {
    return {
      ...extractData(msg.message),
    };
  });

  // Save to DB.
  db.data.signals = formattedArr;
  db.write();

  client.disconnect();
  return formattedArr;
};

export const startListening = async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  // Prompt for phone number and authentication
  await client.start({
    phoneNumber: "+201069392983",
    phoneCode: async () =>
      await input.text("Please enter the verification code you received: "),
    onError: (err) => console.error(err),
  });

  console.log("You are now logged in.");
  console.log("Your session string:", client.session.save());
  console.log("Connected to telegram!");

  // Array of channel titles to listen to
  const channelTitles = [
    "Source 37",
    "Source 47",
    "Source 48",
    "Source 46",
    "Source 22",
    "Source 42",
  ];

  const dialogs = await client.getDialogs({});
  const channels = dialogs.filter((dialog) =>
    channelTitles.includes(dialog.title)
  );

  if (channels.length === 0) {
    console.error("Channels not found");
    return;
  }

  client.addEventHandler((update) => {
    if (!update.message || !update.message.peerId)
      return console.log("message empty");
    console.log(update.message.message);

    const channel = channels.find(
      (c) => c.id === update.message.peerId.channelId
    );

    if (!channel) {
      console.log("got a message but channel not found!");
    } else {
      console.log(channel, "channel");
    }

    // if (channel) {
    phoneNumbers.map((number) => {
      const messageWithChannel = `From ${channel.title}: ${update.message.message}`;
      return client
        .sendMessage(number, { message: messageWithChannel })
        .then(() => console.log("Message forwarded to", number))
        .catch((err) =>
          console.error("Failed to forward message to ", number, err)
        );
    });
    // }
  });
};

export default {
  pullSignals,
};
