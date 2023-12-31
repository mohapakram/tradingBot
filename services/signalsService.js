import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import events from "telegram/events/index.js";
import fs from "fs";
import { JSONPreset } from "lowdb/node";
import { v4 } from "uuid";
import extractData from "../utils/extractData.js";
import checkTemplateStart from "../utils/checkTemplate.js";
import axios from "axios";

// Replace these with your own API ID and Hash
const apiId = 26536993;
const apiHash = "6538bcccfa71573d43080f9688512dc1";

// This string will be populated with your session data
let stringSession = new StringSession(
  "1BAAOMTQ5LjE1NC4xNjcuOTEAUMWJnMt1cNz5sj4Q29iTOoKJiubWxmWTo5oNCn10hXPdyzSyFLDcp65IfJMXlVRWEyAdiK2mh/Evw449RPMklNLv1++qxF88obvQ03YigQhRsyMVs1bzoKwn+1sQAp6B2i8KmpfC3xlw5A/DXqY40sKS6ib9cV/OKf3ZEbMjKnELnNv3pmEhd69nGv3eTrdR1HT+Wpf+CF74mpXn+5ZIqJ8sD6p1l8zt6n6nzFqLKwSClnfiNn5XGH6uJvnB3QsUStOe6sMDGEHFSjt0HLCrgmvvuBlfMgWA3j3x3qik+5xsvKhatiQ00412ukjctjn4YHNHkbo3cSohkW689MW3Egg="
);

const apiKey = "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";

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
  await client.start({
    onError: (err) => console.log(err),
  });
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
  await client.start({
    onError: (err) => console.log(err),
  });
  console.log("Connected to telegram!");
  const channelTitle = "🤑UFO Signals F🤑"; // Replace with the target channel title
  const dialogs = await client.getDialogs({});
  const channel = dialogs.find((dialog) => dialog.title === channelTitle);

  if (!channel) {
    console.error("Channel not found");
    return;
  }

  client.addEventHandler((update) => {
    if (update.message) {
      // Forward message to phone numbers
      phoneNumbers.map((number) => {
        return client
          .sendMessage(number, { message: update.message })
          .then(() => console.log("Message forwarded to", number))
          .catch((err) =>
            console.error("Failed to forward message to ", number, err)
          );
      });

      // db.data.signals.push(extractText(update.message.message));
      // db.write();
    }
  });
};

export default {
  pullSignals,
};
