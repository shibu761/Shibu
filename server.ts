import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. FALLING BACK TO DEMO GENERATOR.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Screenshot Proxy API (Prevents Canvas CORS Taint)
app.get("/api/proxy-image", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).json({ error: "No image URL provided" });
  }

  try {
    console.log(`Proxying image: ${imageUrl}`);
    const fetchResponse = await fetch(imageUrl);
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch image from target URL: ${fetchResponse.statusText}`);
    }

    const contentType = fetchResponse.headers.get("Content-Type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error: any) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to proxy target image. Ensure it exists and is public." });
  }
});

// 2. Microlink Screenshot API Proxy (Bypasses browser CORS & protects secrets)
app.get("/api/fetch-screenshot", async (req, res) => {
  const websiteUrl = req.query.url as string;
  if (!websiteUrl) {
    return res.status(400).json({ error: "No website URL provided" });
  }

  try {
    // We sanitize and encode the URL
    const targetUrl = `https://api.microlink.io?url=${encodeURIComponent(websiteUrl)}&screenshot=true&screenshot.type=png&screenshot.fullPage=true`;
    console.log(`Fetching screenshot via Microlink for: ${websiteUrl}`);
    
    const apiResponse = await fetch(targetUrl);
    if (!apiResponse.ok) {
      throw new Error(`Microlink returned status: ${apiResponse.status}`);
    }

    const result: any = await apiResponse.json();
    if (result.status === "success" && result.data && result.data.screenshot) {
      const screenshotUrl = result.data.screenshot.url;
      console.log(`Successfully obtained screenshot URL: ${screenshotUrl}`);
      return res.json({ screenshotUrl });
    } else {
      throw new Error("Unable to capture website screenshot using microlink.");
    }
  } catch (error: any) {
    console.error("Screenshot capture error:", error);
    res.status(500).json({ error: "Screenshot capture service failed. Please upload an image instead or try another URL." });
  }
});

// 3. AI Analysis & Storyboard Generator Endpoint
app.post("/api/generate-storyboard", async (req, res) => {
  const { url, description, theme } = req.body;

  const demoResponse = {
    siteName: url ? url.replace(/https?:\/\/(www\.)?/, "").split(".")[0].toUpperCase() : "My Website",
    tagline: description || "Modern Product Launch Showcase",
    accentColor: "#3b82f6",
    isAiGenerated: false,
    scenes: [
      {
        id: "s1",
        title: "Welcome to our Platform",
        caption: "We make it clean, robust, and beautifully designed.",
        duration: 4,
        scrollPercentage: 0,
        focusMode: "center",
        narrationText: "Welcome to our website. Today we are showcasing the clean, interactive layout of our modern digital platform."
      },
      {
        id: "s2",
        title: "Powerful Features & Insights",
        caption: "Everything you need to scale operations intelligently.",
        duration: 5,
        scrollPercentage: 30,
        focusMode: "zoom-in",
        narrationText: "Scroll down to discover our central feature dashboard, providing powerful analytics and insights."
      },
      {
        id: "s3",
        title: "Designed for High Performance",
        caption: "Optimized response, fast loading, and flawless execution.",
        duration: 4,
        scrollPercentage: 60,
        focusMode: "pan-left",
        narrationText: "Built with extreme high performance and optimized speed to run smoothly on any laptop."
      },
      {
        id: "s4",
        title: "Simple & Flexible Pricing",
        caption: "Start for free and upgrade as your team expands.",
        duration: 4,
        scrollPercentage: 85,
        focusMode: "pan-right",
        narrationText: "Here you can see our simple pricing plans tailored to expand with your team's ongoing success."
      },
      {
        id: "s5",
        title: "Get Started Instantly",
        caption: "Join thousands of product creators and try it today.",
        duration: 5,
        scrollPercentage: 100,
        focusMode: "tilt-3d",
        narrationText: "Try it today. Join thousands of digital creators who have successfully scaled their products."
      }
    ]
  };

  const ai = getGeminiClient();
  if (!ai) {
    // Fallback if key missing
    console.log("No Gemini API key found, serving standard demo response.");
    return res.json(demoResponse);
  }

  try {
    const prompt = `Analyze this digital website asset. 
    URL: "${url || 'Not Provided'}"
    Self Description: "${description || 'A modern SaaS/product landing page with hero header, product benefits, features, interactive cards, pricing, and contact call to actions'}"
    Theme Mood: "${theme || 'Modern tech'}"

    Develop a professional, structured promotional showcase script and cinematic camera scroll storyboard. 
    Design exactly 5 distinct, sequential scenes detailing standard website sections page flow (e.g., Hero header introduction, Main features list, Interactive dashboards, Pricing structure, and Bottom sign-up / call to action).
    For each scene:
    - Select a reasonable duration of 3 to 6 seconds.
    - Select a scrollPercentage indicating where on the screenshots the camera viewport is focused (e.g., 0% for header, 25-40% for features section, 55-70% for detailed reviews, 80-90% for pricing block, and 100% for footer call to actions).
    - Choose a camera animation styling from: "center", "zoom-in", "pan-left", "pan-right", "tilt-3d".
    - Write a short, highly engaging human-style voice narration. Keep narration concise, friendly and professional.`;

    console.log("Requesting Gemini storyboard generation...");
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            siteName: { type: Type.STRING },
            tagline: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  duration: { type: Type.NUMBER },
                  scrollPercentage: { type: Type.NUMBER },
                  focusMode: { type: Type.STRING },
                  narrationText: { type: Type.STRING }
                },
                required: ["id", "title", "caption", "duration", "scrollPercentage", "focusMode", "narrationText"]
              }
            }
          },
          required: ["siteName", "tagline", "accentColor", "scenes"]
        }
      }
    });

    const outputText = aiResponse.text;
    if (!outputText) {
      throw new Error("Empty text returned from Gemini API.");
    }

    const result = JSON.parse(outputText);
    result.isAiGenerated = true;
    res.json(result);
  } catch (error: any) {
    console.error("Gemini storyboard error:", error);
    // Return high quality fallback
    res.json({ ...demoResponse, error: "AI service is currently busy. Loaded a smart offline preview." });
  }
});

// Serve frontend assets
async function startServer() {
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
