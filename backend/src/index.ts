import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

// Initialize Gemini API with API Key
const genAI = new GoogleGenerativeAI(process.env.GEM_API!);

const app = express();
app.use(express.json());
app.use(cors());

app.post("/chat", async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  try {
    // ✅ Use Correct Model Name for Free Tier
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Faster & free

    const result = await model.generateContent(prompt);
    const response = await result.response.text(); // Extract text from response

    res.json({ response });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
