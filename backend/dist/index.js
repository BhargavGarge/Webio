var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt, BASE_PROMPT } from "./prompt.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
// Load environment variables
dotenv.config();
// Initialize Gemini API with API Key
const genAI = new GoogleGenerativeAI(process.env.GEM_API);
const app = express();
app.use(express.json());
app.use(cors());
app.post("/template", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }
    try {
      const systemMessage =
        "Determine whether the given project should be classified as 'node' or 'react'. ONLY return the exact word 'node' or 'react' with no punctuation, explanations, or additional text.";
      const fullPrompt = `${systemMessage}\n\nUser request: ${prompt}`;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = yield model.generateContent(fullPrompt);
      const answer = (yield result.response.text()).trim().toLowerCase();
      console.log("Gemini Response:", answer); // Debugging log
      if (answer === "react") {
        res.json({
          prompts: [
            `${BASE_PROMPT} Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
          ],
          uiPrompts: [reactBasePrompt],
        });
        return;
      }
      if (answer === "node") {
        res.json({
          prompts: [
            `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
          ],
          uiPrompts: [nodeBasePrompt],
        });
        return;
      }
      console.log("Unexpected Response:", answer); // Log unexpected responses
      res.status(403).json({ message: "You can't access this" });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "Internal Server Error",
      });
    }
  })
);
app.post("/chat", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { messages } = req.body;
    if (!messages) {
      res.status(400).json({ error: "Messages are required" });
      return;
    }
    try {
      const systemMessage = getSystemPrompt(); // Get system prompt
      const fullPrompt = `${systemMessage}\n\n${JSON.stringify(messages)}`;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = yield model.generateContent(fullPrompt);
      const responseText = yield result.response.text();
      res.json({ response: responseText });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "Internal Server Error",
      });
    }
  })
);
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
