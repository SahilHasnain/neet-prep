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

    // Parse request body (req.body might already be an object or a string)
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};

    const { type } = body;

    // Route to appropriate handler
    if (type === "remediation") {
      return await handleRemediation(body, res, log, error);
    } else if (type === "quiz_questions") {
      return await handleQuizQuestions(body, res, log, error);
    } else {
      return await handleFlashcardGeneration(body, res, log, error);
    }
  } catch (err) {
    error(`Error in function: ${err.message}`);
    return res.json(
      {
        success: false,
        error: "Internal server error",
        message: err.message,
      },
      500,
    );
  }
};

/**
 * Handle flashcard generation
 */
async function handleFlashcardGeneration(body, res, log, error) {
  try {
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
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
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
}

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
    max_tokens: 2048, // Reduced for faster response
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

/**
 * Generate remediation content using GROQ AI
 */
async function generateRemediationWithGroq(
  groq,
  conceptName,
  subject,
  topic,
  mistakeCount,
  log,
) {
  const prompt = buildRemediationPrompt(
    conceptName,
    subject,
    topic,
    mistakeCount,
  );

  log("Calling GROQ API for remediation...");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert NEET exam tutor specializing in Biology, Physics, and Chemistry. Create personalized remediation content to help students understand concepts they struggle with. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error("Empty response from GROQ API");
  }

  log("Parsing GROQ remediation response...");

  const parsed = JSON.parse(responseText);

  return {
    explanation: parsed.explanation || "",
    practice_questions: parsed.practice_questions || [],
    misconception: parsed.misconception || "",
  };
}

/**
 * Build the prompt for remediation content
 */
function buildRemediationPrompt(conceptName, subject, topic, mistakeCount) {
  return `Generate personalized remediation content for a NEET student who has made ${mistakeCount} mistake(s) on the concept: "${conceptName}" in ${subject} (${topic}).

Requirements:
1. Explanation: Provide a clear, concise explanation (2-3 sentences) of this concept suitable for NEET exam preparation
2. Practice Questions: Create exactly 3 multiple-choice questions to test understanding
   - Each question should have 4 options
   - Include the correct answer
   - Provide a brief explanation for the correct answer
3. Common Misconception: Identify one common mistake students make with this concept and how to avoid it

Return ONLY a JSON object in this exact format:
{
  "explanation": "Clear explanation of the concept here",
  "practice_questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "Why this is correct"
    }
  ],
  "misconception": "Common mistake and how to avoid it"
}`;
}

/**
 * Handle remediation content generation
 */
async function handleRemediation(body, res, log, error) {
  try {
    const { concept_id, concept_name, subject, topic, mistake_count } = body;

    if (!concept_id || !concept_name || !subject || !topic) {
      return res.json(
        {
          success: false,
          error:
            "Missing required fields: concept_id, concept_name, subject, topic",
        },
        400,
      );
    }

    log(`Generating remediation for concept: ${concept_name} (${subject})`);

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const remediationContent = await generateRemediationWithGroq(
      groq,
      concept_name,
      subject,
      topic,
      mistake_count || 1,
      log,
    );

    log(`Successfully generated remediation for ${concept_name}`);

    return res.json({
      success: true,
      data: {
        concept_id,
        ...remediationContent,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    error(`Error generating remediation: ${err.message}`);
    return res.json(
      {
        success: false,
        error: "Failed to generate remediation",
        message: err.message,
      },
      500,
    );
  }
}

/**
 * Handle quiz question generation
 */
async function handleQuizQuestions(body, res, log, error) {
  try {
    const { cards, quiz_type, question_count } = body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.json(
        { success: false, error: "Missing or invalid cards array" },
        400,
      );
    }

    if (
      !quiz_type ||
      !["mcq", "true_false", "fill_blank"].includes(quiz_type)
    ) {
      return res.json(
        {
          success: false,
          error: "Invalid quiz_type. Must be: mcq, true_false, or fill_blank",
        },
        400,
      );
    }

    log(`Generating ${quiz_type} questions for ${cards.length} cards`);

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const questions = await generateQuizQuestionsWithGroq(
      groq,
      cards,
      quiz_type,
      question_count || cards.length,
      log,
    );

    log(`Successfully generated ${questions.length} quiz questions`);

    return res.json({
      success: true,
      data: {
        questions,
        quiz_type,
        count: questions.length,
      },
    });
  } catch (err) {
    error(`Error generating quiz questions: ${err.message}`);
    return res.json(
      {
        success: false,
        error: "Failed to generate quiz questions",
        message: err.message,
      },
      500,
    );
  }
}

/**
 * Generate quiz questions using GROQ AI
 */
async function generateQuizQuestionsWithGroq(
  groq,
  cards,
  quizType,
  questionCount,
  log,
) {
  const prompt = buildQuizQuestionsPrompt(cards, quizType, questionCount);

  log("Calling GROQ API for quiz questions...");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an expert NEET exam question creator. Generate high-quality quiz questions from flashcard content. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error("Empty response from GROQ API");
  }

  log("Parsing GROQ quiz questions response...");

  const parsed = JSON.parse(responseText);
  const questions = parsed.questions || [];

  // Add question_id and type to each question
  return questions.map((q, index) => ({
    question_id: `q_${q.card_id || index}_${Date.now()}_${index}`,
    card_id: q.card_id || cards[index]?.card_id || `card_${index}`,
    type: quizType,
    question: q.question,
    options: q.options || undefined,
    correct_answer: q.correct_answer,
  }));
}

/**
 * Build prompt for quiz question generation
 */
function buildQuizQuestionsPrompt(cards, quizType, questionCount) {
  const cardsText = cards
    .map(
      (c, i) =>
        `${i + 1}. Front: ${c.front_content}\n   Back: ${c.back_content}`,
    )
    .join("\n\n");

  if (quizType === "mcq") {
    return `Generate ${questionCount} multiple-choice questions from these flashcards:

${cardsText}

For each card, create an MCQ question with:
- Question based on the front content
- 4 options (one correct answer from back content + 3 plausible distractors)
- Correct answer clearly marked

Return ONLY a JSON object:
{
  "questions": [
    {
      "card_id": "card_id_here",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B"
    }
  ]
}`;
  } else if (quizType === "true_false") {
    return `Generate ${questionCount} true/false questions from these flashcards:

${cardsText}

For each card, create a statement that can be true or false based on the content.
Mix true and false statements.

Return ONLY a JSON object:
{
  "questions": [
    {
      "card_id": "card_id_here",
      "question": "Statement to evaluate",
      "correct_answer": "true" or "false"
    }
  ]
}`;
  } else {
    // fill_blank
    return `Generate ${questionCount} fill-in-the-blank questions from these flashcards:

${cardsText}

For each card, create a sentence with a key term blanked out (use _____ for blank).
The blank should be a critical term from the back content.

Return ONLY a JSON object:
{
  "questions": [
    {
      "card_id": "card_id_here",
      "question": "Sentence with _____ blank",
      "correct_answer": "word or phrase that fills the blank"
    }
  ]
}`;
  }
}
