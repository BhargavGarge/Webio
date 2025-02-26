var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Load environment variables
dotenv.config();
// Initialize Gemini API with API Key
const genAI = new GoogleGenerativeAI(process.env.GEM_API);
const app = express();
app.use(express.json());
app.use(cors());
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
    }
    try {
        // ✅ Use Correct Model Name for Free Tier
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Faster & free
        const result = yield model.generateContent(prompt);
        const response = yield result.response.text(); // Extract text from response
        res.json({ response });
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({
            error: error.message || "Internal Server Error",
        });
    }
}));
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
