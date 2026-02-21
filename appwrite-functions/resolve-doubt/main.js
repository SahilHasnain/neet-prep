/**
 * Appwrite Function: Resolve Doubt
 * Uses GROQ AI to provide instant explanations for student doubts
 */

import Groq from "groq-sdk";
import { Client, Databases, ID } from "node-appwrite";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = "flashcard_db";

export default async ({ req, res, log, error }) => {
  try {
    if (req.method !== "POST") {
      return res.json({ success: false, error: "Method not allowed" }, 405);
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const { doubt_text, context, user_id, card_id, deck_id } = body;

    if (!doubt_text || !user_id) {
      return res.json(
        {
          success: false,
          error: "Missing required fields: doubt_text, user_id",
        },
        400,
      );
    }

    log(`Resolving doubt: ${doubt_text.substring(0, 50)}...`);

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const explanation = await generateExplanation(
      groq,
      doubt_text,
      context,
      log,
    );

    // Store doubt in database
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    const doubtId = ID.unique();

    await databases.createDocument(DATABASE_ID, "doubts", doubtId, {
      doubt_id: doubtId,
      user_id,
      card_id: card_id || null,
      deck_id: deck_id || null,
      doubt_text,
      context: context || null,
      explanation: explanation.answer,
      examples: JSON.stringify(explanation.examples),
      related_concepts: JSON.stringify(explanation.related_concepts),
      created_at: new Date().toISOString(),
    });

    log("Doubt resolved and stored successfully");

    return res.json({
      success: true,
      data: {
        doubt_id: doubtId,
        ...explanation,
      },
    });
  } catch (err) {
    error(`Error resolving doubt: ${err.message}`);
    return res.json(
      {
        success: false,
        error: "Failed to resolve doubt",
        message: err.message,
      },
      500,
    );
  }
};

async function generateExplanation(groq, doubtText, context, log) {
  const prompt = buildExplanationPrompt(doubtText, context);

  log("Calling GROQ API for explanation...");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert tutor who explains concepts clearly and simply. Break down complex topics into easy-to-understand explanations with practical examples. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error("Empty response from GROQ API");
  }

  const parsed = JSON.parse(responseText);

  return {
    answer: parsed.answer || "",
    examples: parsed.examples || [],
    related_concepts: parsed.related_concepts || [],
  };
}

function buildExplanationPrompt(doubtText, context) {
  return `A student has the following doubt: "${doubtText}"

${context ? `Context: ${context}` : ""}

Provide a clear, comprehensive explanation that:
1. Directly answers the doubt in simple terms (2-3 sentences)
2. Provides 2-3 practical examples to illustrate the concept
3. Lists 2-3 related concepts the student should understand

Return ONLY a JSON object in this format:
{
  "answer": "Clear, simple explanation here",
  "examples": [
    "Example 1: Practical illustration",
    "Example 2: Another example"
  ],
  "related_concepts": [
    "Related concept 1",
    "Related concept 2"
  ]
}`;
}
