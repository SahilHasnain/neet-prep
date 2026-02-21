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
          "You are a friendly NEET exam tutor who explains concepts in Hinglish (mix of Hindi and English) using simple, student-friendly language. Use common Hindi words naturally mixed with English technical terms. Be conversational and encouraging like a helpful senior student. Always respond with valid JSON only.",
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
  return `Ek NEET student ka doubt hai: "${doubtText}"

${context ? `Context: ${context}` : ""}

Explanation Hinglish mein do (Hindi + English mix), jaise ek friendly senior student samjhata hai:

Requirements:
1. Answer simple aur clear ho, Hinglish mein (2-3 sentences)
   - Common Hindi words naturally use karo: "samajh", "matlab", "basically", "hota hai", "kyunki", etc.
   - Technical terms English mein rakho: "mitochondria", "ATP", "photosynthesis"
   - Conversational tone rakho: "Dekho yaar", "Basically", "Samjho aise"

2. 2-3 practical examples do jo relatable ho
   - Real-life se connect karo
   - Simple language mein
   - "Jaise ki..." ya "Example ke liye..." se start karo

3. 2-3 related concepts batao jo isse connected hai
   - Short aur clear names
   - Jo NEET ke liye important hai

Return ONLY a JSON object in this format:
{
  "answer": "Hinglish mein clear explanation yaha",
  "examples": [
    "Example 1: Practical illustration Hinglish mein",
    "Example 2: Another example"
  ],
  "related_concepts": [
    "Related concept 1",
    "Related concept 2"
  ]
}

Example response style:
"Dekho, mitochondria ko powerhouse isliye kehte hai kyunki ye ATP banata hai through cellular respiration. Basically, glucose ko break karke energy release hoti hai jo cell ke saare kaam ke liye use hoti hai."`;
}
