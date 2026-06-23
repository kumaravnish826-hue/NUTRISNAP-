import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Route: Scan Food from Image
  app.post("/api/scan", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No image provided" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: "Analyze the food in this image with maximum precision. Identify the exact meal and ingredients with 100% accuracy. Provide a highly accurate nutritional breakdown. Also provide a detailed breakdown of the exact items and their quantities (like '2 Roti', '150g Rice', '1 Bowl Dal'). Return a JSON object with recipeName, calories, proteinGrams, carbsGrams, fatsGrams, and an items array.",
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipeName: { type: Type.STRING, description: "Highly accurate name of the food or recipe" },
              calories: { type: Type.NUMBER, description: "Estimated total calories" },
              proteinGrams: { type: Type.NUMBER, description: "Estimated protein in grams" },
              carbsGrams: { type: Type.NUMBER, description: "Estimated carbs in grams" },
              fatsGrams: { type: Type.NUMBER, description: "Estimated fats in grams" },
              items: {
                type: Type.ARRAY,
                description: "Detailed breakdown of the food items and their exact quantities",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the item (e.g., Roti, Rice)" },
                    quantity: { type: Type.STRING, description: "Quantity (e.g., 2 pieces, 150g)" }
                  },
                  required: ["name", "quantity"]
                }
              }
            },
            required: ["recipeName", "calories", "proteinGrams", "carbsGrams", "fatsGrams", "items"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response text");
      
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Scan error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  // API Route: Calorie Planner
  app.post("/api/plan", async (req, res) => {
    try {
      const { age, weight, height, gender, activityLevel, targetWeight, language } = req.body;

      const langString = language === "hi" ? "in Hindi language" : "in English language";

      const prompt = `I am a ${age} year old ${gender}, weight ${weight}kg, height ${height}cm. My activity level is ${activityLevel}. I want to reach ${targetWeight}kg.
Please act as an advanced AI fitness coach. Create a highly customized diet plan ${langString} tailored to my daily calorie goals based on my metrics.
Return as a JSON object containing:
- recommendedCalories: The calculated daily calorie target (number)
- tips: 3-4 expert diet tips
- dietPlan: structured object with 'breakfast', 'lunch', 'dinner', and 'snacks' fields containing meal recommendations.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedCalories: { type: Type.NUMBER, description: "The daily calorie target" },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Expert diet tips",
              },
              dietPlan: {
                type: Type.OBJECT,
                properties: {
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  dinner: { type: Type.STRING },
                  snacks: { type: Type.STRING },
                },
                required: ["breakfast", "lunch", "dinner", "snacks"],
              }
            },
            required: ["recommendedCalories", "tips", "dietPlan"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response text");

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Plan error:", error);
      res.status(500).json({ error: error.message || "Failed to generate plan" });
    }
  });

  // API Route: AI Recipe Generator
  app.post("/api/recipe", async (req, res) => {
    try {
      const { ingredients, language } = req.body;
      const langString = language === "hi" ? "in Hindi language" : "in English language";
      const prompt = `Act as an expert nutritionist cook. I have these ingredients: ${ingredients}.
Create a healthy recipe ${langString} using some or all of these. Return a JSON object with:
- title: Recipe name
- calories: Estimated calories per serving
- protein: Estimated protein (g)
- carbs: Estimated carbs (g)
- fats: Estimated fats (g)
- instructions: Array of step-by-step cooking instructions (strings)
- match: Percentage match (how well it uses my ingredients, out of 100)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              match: { type: Type.NUMBER }
            },
            required: ["title", "calories", "protein", "carbs", "fats", "instructions", "match"]
          }
        }
      });
      const text = response.text;
      res.json(JSON.parse(text || "{}"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: AI Text Estimation for Food/Exercise
  app.post("/api/estimate", async (req, res) => {
    try {
      const { query, type } = req.body;
      let prompt, schema;

      if (type === "FOOD") {
        prompt = `Analyze this food query: "${query}". Estimate the nutritional values accurately.
                  Also extract or estimate the exact breakdown of items and quantities (like '2 Roti', '150g Rice').
                  Return a JSON object with:
                  - calories: estimated total calories as nearest integer
                  - protein: estimated protein in grams as nearest integer
                  - carbs: estimated carbs in grams as nearest integer
                  - fats: estimated fat in grams as nearest integer
                  - items: array of objects with 'name' and 'quantity' strings`;
        schema = {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.STRING }
                  },
                  required: ["name", "quantity"]
                }
              }
            },
            required: ["calories", "protein", "carbs", "fats", "items"],
          };
      } else {
        prompt = `Analyze this exercise query: "${query}". Estimate the calories burned for an average adult person.
                  Return a JSON object with:
                  - calories: estimated calories burned as nearest integer`;
        schema = {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
            },
            required: ["calories"],
          };
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });
      const text = response.text;
      res.json(JSON.parse(text || "{}"));
    } catch (error: any) {
      console.error("Estimate error:", error);
      res.status(500).json({ error: error.message || "Failed to estimate" });
    }
  });

  app.post("/api/estimate-steps", async (req, res) => {
    try {
      const { query, user } = req.body;
      const prompt = `Analyze this physical activity description: "${query}". The user is: ${user || 'average adult'}. 
                      Estimate the realistic number of steps taken during this activity.
                      Return a JSON object with:
                      - steps: integer (realistic step count)`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: { type: Type.NUMBER },
            },
            required: ["steps"],
          },
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("Steps estimate error:", error);
      res.status(500).json({ error: error.message || "Failed to estimate steps" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
