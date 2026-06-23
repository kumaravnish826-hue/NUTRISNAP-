var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
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
              mimeType: mimeType || "image/jpeg"
            }
          },
          {
            text: "Analyze the food in this image with maximum precision. Identify the exact meal and ingredients with 100% accuracy. Provide a highly accurate nutritional breakdown. Also provide a detailed breakdown of the exact items and their quantities (like '2 Roti', '150g Rice', '1 Bowl Dal'). Return a JSON object with recipeName, calories, proteinGrams, carbsGrams, fatsGrams, and an items array."
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              recipeName: { type: import_genai.Type.STRING, description: "Highly accurate name of the food or recipe" },
              calories: { type: import_genai.Type.NUMBER, description: "Estimated total calories" },
              proteinGrams: { type: import_genai.Type.NUMBER, description: "Estimated protein in grams" },
              carbsGrams: { type: import_genai.Type.NUMBER, description: "Estimated carbs in grams" },
              fatsGrams: { type: import_genai.Type.NUMBER, description: "Estimated fats in grams" },
              items: {
                type: import_genai.Type.ARRAY,
                description: "Detailed breakdown of the food items and their exact quantities",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    name: { type: import_genai.Type.STRING, description: "Name of the item (e.g., Roti, Rice)" },
                    quantity: { type: import_genai.Type.STRING, description: "Quantity (e.g., 2 pieces, 150g)" }
                  },
                  required: ["name", "quantity"]
                }
              }
            },
            required: ["recipeName", "calories", "proteinGrams", "carbsGrams", "fatsGrams", "items"]
          }
        }
      });
      const text = response.text;
      if (!text) throw new Error("No response text");
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error) {
      console.error("Scan error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });
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
            type: import_genai.Type.OBJECT,
            properties: {
              recommendedCalories: { type: import_genai.Type.NUMBER, description: "The daily calorie target" },
              tips: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Expert diet tips"
              },
              dietPlan: {
                type: import_genai.Type.OBJECT,
                properties: {
                  breakfast: { type: import_genai.Type.STRING },
                  lunch: { type: import_genai.Type.STRING },
                  dinner: { type: import_genai.Type.STRING },
                  snacks: { type: import_genai.Type.STRING }
                },
                required: ["breakfast", "lunch", "dinner", "snacks"]
              }
            },
            required: ["recommendedCalories", "tips", "dietPlan"]
          }
        }
      });
      const text = response.text;
      if (!text) throw new Error("No response text");
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error) {
      console.error("Plan error:", error);
      res.status(500).json({ error: error.message || "Failed to generate plan" });
    }
  });
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
            type: import_genai.Type.OBJECT,
            properties: {
              title: { type: import_genai.Type.STRING },
              calories: { type: import_genai.Type.NUMBER },
              protein: { type: import_genai.Type.NUMBER },
              carbs: { type: import_genai.Type.NUMBER },
              fats: { type: import_genai.Type.NUMBER },
              instructions: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              },
              match: { type: import_genai.Type.NUMBER }
            },
            required: ["title", "calories", "protein", "carbs", "fats", "instructions", "match"]
          }
        }
      });
      const text = response.text;
      res.json(JSON.parse(text || "{}"));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
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
          type: import_genai.Type.OBJECT,
          properties: {
            calories: { type: import_genai.Type.NUMBER },
            protein: { type: import_genai.Type.NUMBER },
            carbs: { type: import_genai.Type.NUMBER },
            fats: { type: import_genai.Type.NUMBER },
            items: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  name: { type: import_genai.Type.STRING },
                  quantity: { type: import_genai.Type.STRING }
                },
                required: ["name", "quantity"]
              }
            }
          },
          required: ["calories", "protein", "carbs", "fats", "items"]
        };
      } else {
        prompt = `Analyze this exercise query: "${query}". Estimate the calories burned for an average adult person.
                  Return a JSON object with:
                  - calories: estimated calories burned as nearest integer`;
        schema = {
          type: import_genai.Type.OBJECT,
          properties: {
            calories: { type: import_genai.Type.NUMBER }
          },
          required: ["calories"]
        };
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      const text = response.text;
      res.json(JSON.parse(text || "{}"));
    } catch (error) {
      console.error("Estimate error:", error);
      res.status(500).json({ error: error.message || "Failed to estimate" });
    }
  });
  app.post("/api/estimate-steps", async (req, res) => {
    try {
      const { query, user } = req.body;
      const prompt = `Analyze this physical activity description: "${query}". The user is: ${user || "average adult"}. 
                      Estimate the realistic number of steps taken during this activity.
                      Return a JSON object with:
                      - steps: integer (realistic step count)`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              steps: { type: import_genai.Type.NUMBER }
            },
            required: ["steps"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("Steps estimate error:", error);
      res.status(500).json({ error: error.message || "Failed to estimate steps" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
