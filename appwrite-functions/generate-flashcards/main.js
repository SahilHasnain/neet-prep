/**
 * Appwrite Function: Generate Flashcards
 * Uses GROQ AI to generate flashcards based on user input
 */

import Groq from "groq-sdk";
import { Client, Databases, ID } from "node-appwrite";

// Environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = "flashcard_db";

/**
 * Main function handler
 */
export default async ({ req, res, log, error }) => {
  try {
    // Validate request method
    if (req.method !== "POST") {
      return res.json({ success: false, error: "Method not allowed" }, 405);
    }

    // Parse request body
    const body = JSON.parse(req.body || "{}");
    const {
      topic,
      count = 10,
      difficulty = "medium",
      language = "en",
      userId,
      deckId,
    } = body;

    // Validate inputs
    if (!topic || !userId) {
      return res.json(
        { success: false, error: "Missing required fields: topic, userId" },
        400,
      );
    }

    if (count < 5 || count > 50) {
      return res.json(
        { success: false, error: "Count must be between 5 and 50" },
        400,
      );
    }

    log(`Generating ${count} flashcards for topic: ${topic}`);

    // Initialize GROQ client
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // Generate flashcards using GROQ
    const flashcards = await generateFlashcardsWithGroq(
      groq,
      topic,
      count,
      difficulty,
      language,
      log,
    );

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Log the generation
    await logGeneration(
      databases,
      userId,
      deckId,
      topic,
      flashcards.length,
      "success",
      null,
    );

    log(`Successfully generated ${flashcards.length} flashcards`);

    return res.json({
      success: true,
      data: {
        flashcards,
        count: flashcards.length,
        topic,
        difficulty,
      },
    });
  } catch (err) {
    error(`Error generating flashcards: ${err.message}`);

    // Try to log the error
    try {
      const body = JSON.parse(req.body || "{}");
      const { userId, deckId, topic } = body;

      if (userId) {
        const client = new Client()
          .setEndpoint(APPWRITE_ENDPOINT)
          .setProject(APPWRITE_PROJECT_ID)
          .setKey(APPWRITE_API_KEY);

        const databases = new Databases(client);

        await logGeneration(
          databases,
          userId,
          deckId,
          topic || "unknown",
          0,
          "failed",
          err.message,
        );
      }
    } catch (logError) {
      error(`Failed to log error: ${logError.message}`);
    }

    return res.json(
      {
        success: false,
        error: "Failed to generate flashcards",
        message: err.message,
      },
      500,
    );
  }
};

/**
 * Generate flashcards using GROQ AI
 */
async function generateFlashcardsWithGroq(
  groq,
  topic,
  count,
  difficulty,
  language,
  log,
) {
  const prompt = buildPrompt(topic, count, difficulty, language);

  log("Calling GROQ API...");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert educational content creator specializing in creating effective flashcards for learning. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error("Empty response from GROQ API");
  }

  log("Parsing GROQ response...");

  const parsed = JSON.parse(responseText);
  const flashcards = parsed.flashcards || [];

  // Validate and format flashcards
  return flashcards.map((card, index) => ({
    front_content: card.front || card.question || "",
    back_content: card.back || card.answer || "",
    difficulty: difficulty,
    tags: card.tags || [],
    order_index: index,
  }));
}

/**
 * Build the prompt for GROQ AI
 */
function buildPrompt(topic, count, difficulty, language) {
  return `Generate ${count} high-quality flashcards about "${topic}" in ${language} language.

Difficulty level: ${difficulty}

Requirements:
- Create exactly ${count} flashcards
- Each flashcard should have a clear question/concept on the front and a concise answer on the back
- Make questions specific and answers informative but brief
- Include relevant tags for categorization
- Ensure content is accurate and educational
- For ${difficulty} difficulty: ${getDifficultyGuidance(difficulty)}

Return ONLY a JSON object in this exact format:
{
  "flashcards": [
    {
      "front": "Question or concept here",
      "back": "Answer or explanation here",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
}

/**
 * Get difficulty-specific guidance
 */
function getDifficultyGuidance(difficulty) {
  switch (difficulty) {
    case "easy":
      return "Use simple concepts, basic terminology, and straightforward questions";
    case "hard":
      return "Use advanced concepts, technical terminology, and complex questions requiring deep understanding";
    default:
      return "Use moderate complexity with clear explanations";
  }
}

/**
 * Log generation to database
 */
async function logGeneration(
  databases,
  userId,
  deckId,
  prompt,
  cardsGenerated,
  status,
  errorMessage,
) {
  try {
    await databases.createDocument(
      DATABASE_ID,
      "ai_generation_logs",
      ID.unique(),
      {
        log_id: ID.unique(),
        user_id: userId,
        deck_id: deckId || null,
        prompt,
        cards_generated: cardsGenerated,
        status,
        error_message: errorMessage || null,
        created_at: new Date().toISOString(),
      },
    );
  } catch (err) {
    console.error("Failed to log generation:", err.message);
  }
}
