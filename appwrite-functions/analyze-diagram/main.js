/**
 * Appwrite Function: Analyze Diagram
 * Uses GROQ Vision API to analyze diagram images and suggest labels
 */

import Groq from "groq-sdk";
import { Client, Databases, ID, Storage } from "node-appwrite";
import { Buffer } from "node:buffer";

// Environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = "flashcard_db";
const BUCKET_ID = "flashcard_images";

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
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};

    const {
      imageId,
      userId,
      cardId,
      diagramType = "general",
      language = "en",
      mode = "label_detection", // label_detection, quality_check, generate_quiz
    } = body;

    // Validate inputs
    if (!imageId || !userId || !cardId) {
      return res.json(
        {
          success: false,
          error: "Missing required fields: imageId, userId, cardId",
        },
        400,
      );
    }

    log(`Analyzing diagram (mode: ${mode}) for card: ${cardId}`);

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    const databases = new Databases(client);
    const storage = new Storage(client);

    // Download image from storage
    const imageBuffer = await downloadImage(storage, imageId, log);

    // Process image for AI
    const processedImage = await processImageForAI(imageBuffer, mode, log);

    // Initialize GROQ client
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    let result;
    const startTime = Date.now();

    // Route to appropriate handler
    if (mode === "label_detection") {
      result = await detectLabels(
        groq,
        processedImage,
        diagramType,
        language,
        log,
      );
    } else if (mode === "quality_check") {
      result = await checkQuality(groq, processedImage, imageBuffer, log);
    } else {
      return res.json({ success: false, error: "Invalid mode" }, 400);
    }

    const processingTime = Date.now() - startTime;

    // Log analysis to database
    await logAnalysis(
      databases,
      userId,
      cardId,
      imageId,
      mode,
      "success",
      result,
      processingTime,
      null,
    );

    log(`Analysis completed in ${processingTime}ms`);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    error(`Error analyzing diagram: ${err.message}`);

    // Try to log the error
    try {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};
      const { userId, cardId, imageId, mode } = body;

      if (userId && cardId) {
        const client = new Client()
          .setEndpoint(APPWRITE_ENDPOINT)
          .setProject(APPWRITE_PROJECT_ID)
          .setKey(APPWRITE_API_KEY);

        const databases = new Databases(client);

        await logAnalysis(
          databases,
          userId,
          cardId,
          imageId || "unknown",
          mode || "unknown",
          "failed",
          null,
          0,
          err.message,
        );
      }
    } catch (logError) {
      error(`Failed to log error: ${logError.message}`);
    }

    return res.json(
      {
        success: false,
        error: "Failed to analyze diagram",
        message: err.message,
      },
      500,
    );
  }
};

/**
 * Download image from Appwrite Storage
 */
async function downloadImage(storage, imageId, log) {
  try {
    log(`Downloading image: ${imageId}`);
    const result = await storage.getFileDownload(BUCKET_ID, imageId);
    return Buffer.from(result);
  } catch (err) {
    throw new Error(`Failed to download image: ${err.message}`);
  }
}

/**
 * Process image for AI analysis
 */
async function processImageForAI(imageBuffer, mode, log) {
  try {
    log("Processing image for AI...");

    // Convert buffer to base64 directly
    // GROQ API will handle the image as-is
    const base64 = imageBuffer.toString("base64");

    // Detect image type from buffer header
    let mimeType = "image/jpeg";
    if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
      mimeType = "image/png";
    } else if (imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) {
      mimeType = "image/jpeg";
    }

    log(`Image size: ${(imageBuffer.length / 1024).toFixed(2)}KB`);

    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    throw new Error(`Failed to process image: ${err.message}`);
  }
}

/**
 * Detect labels in diagram using GROQ Vision
 */
async function detectLabels(groq, imageBase64, diagramType, language, log) {
  log("Calling GROQ Vision API for label detection...");

  const prompt = buildLabelDetectionPrompt(diagramType, language);

  const completion = await callGroqWithRetry(async () => {
    return await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert educator analyzing educational diagrams. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      model: "llama-3.2-90b-vision-preview",
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error("Empty response from GROQ API");
  }

  log("Parsing GROQ response...");
  const parsed = JSON.parse(responseText);
  const labels = parsed.labels || [];

  // Validate and format labels
  const validatedLabels = labels
    .filter((label) => {
      return (
        label.label_text &&
        typeof label.x_position === "number" &&
        typeof label.y_position === "number" &&
        label.x_position >= 0 &&
        label.x_position <= 100 &&
        label.y_position >= 0 &&
        label.y_position <= 100
      );
    })
    .map((label) => ({
      label_text: label.label_text.trim(),
      x_position: Math.round(label.x_position * 10) / 10,
      y_position: Math.round(label.y_position * 10) / 10,
      confidence: label.confidence || 0.8,
      description: label.description || "",
    }));

  log(`Detected ${validatedLabels.length} valid labels`);

  return {
    labels: validatedLabels,
    count: validatedLabels.length,
  };
}

/**
 * Check diagram quality using GROQ Vision
 */
async function checkQuality(groq, imageBase64, originalBuffer, log) {
  log("Checking diagram quality...");

  // Get basic metrics from buffer
  const fileSizeKB = originalBuffer.length / 1024;

  let score = 10;
  const issues = [];
  const suggestions = [];

  // Check file size
  if (originalBuffer.length < 100000) {
    issues.push("File size too small, may indicate low quality");
    suggestions.push("Use a higher quality image (at least 100KB)");
    score -= 1;
  }

  // Check if file is too large (over 5MB)
  if (originalBuffer.length > 5 * 1024 * 1024) {
    issues.push("File size very large");
    suggestions.push("Consider compressing the image");
    score -= 0.5;
  }

  // Use AI to assess content quality
  const prompt = `Assess this educational diagram for learning purposes.

Evaluate:
1. Clarity: Are parts clearly visible and distinguishable?
2. Contrast: Is there sufficient contrast between elements?
3. Label visibility: Can text/labels be easily read?
4. Complexity: Is it suitable for educational use?
5. Overall quality: Is this a good learning resource?

Return JSON with:
- clarity_score (0-10)
- contrast_score (0-10)
- educational_value (0-10)
- issues (array of strings)
- suggestions (array of strings)

Be concise and specific.`;

  try {
    const completion = await callGroqWithRetry(async () => {
      return await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        model: "llama-3.2-11b-vision-preview", // Faster model for quality check
        temperature: 0.2,
        max_tokens: 512,
        response_format: { type: "json_object" },
      });
    });

    const aiResponse = JSON.parse(
      completion.choices[0]?.message?.content || "{}",
    );

    // Combine AI assessment with technical checks
    const aiScore =
      (aiResponse.clarity_score +
        aiResponse.contrast_score +
        aiResponse.educational_value) /
      3;
    score = Math.min(score, aiScore);

    if (aiResponse.issues) {
      issues.push(...aiResponse.issues);
    }
    if (aiResponse.suggestions) {
      suggestions.push(...aiResponse.suggestions);
    }
  } catch (err) {
    log(`AI quality check failed: ${err.message}`);
    // Continue with technical assessment only
  }

  return {
    score: Math.round(score * 10) / 10,
    issues,
    suggestions,
    is_acceptable: score >= 6,
    metadata: {
      width: 0, // Not available without sharp
      height: 0, // Not available without sharp
      format: "unknown",
      size: originalBuffer.length,
    },
  };
}

/**
 * Build prompt for label detection
 */
function buildLabelDetectionPrompt(diagramType, language) {
  const typeGuidance = {
    anatomy: "Focus on anatomical structures and organs",
    cell: "Identify cellular organelles and structures",
    circuit: "Identify electrical components and connections",
    chemistry: "Identify molecules, atoms, and chemical structures",
    physics: "Identify physical components and force vectors",
    general: "Identify all educationally significant parts",
  };

  const guidance = typeGuidance[diagramType] || typeGuidance.general;

  return `You are an expert ${diagramType === "general" ? "" : diagramType} educator analyzing an educational diagram.

Analyze this diagram and identify all labeled or identifiable parts. ${guidance}.

For each part, provide:
1. label_text: The name of the part (concise, 2-5 words, in ${language})
2. x_position: Horizontal position as percentage (0-100) from left edge
3. y_position: Vertical position as percentage (0-100) from top edge
4. confidence: Your confidence in this identification (0.0-1.0)
5. description: Brief educational description (1 sentence, in ${language})

Guidelines:
- Focus on educationally significant parts only
- Use standard scientific terminology
- Position should point to the CENTER of each part
- Only include parts you can clearly identify
- Aim for 5-15 labels per diagram
- Be precise with positions

Return ONLY valid JSON:
{
  "labels": [
    {
      "label_text": "Part Name",
      "x_position": 45.5,
      "y_position": 60.2,
      "confidence": 0.95,
      "description": "Brief description"
    }
  ]
}`;
}

/**
 * Call GROQ API with retry logic
 */
async function callGroqWithRetry(requestFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      // Rate limited - exponential backoff
      if (error.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Timeout - retry
      if (error.status === 504 && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Other errors - throw immediately
      throw error;
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Log analysis to database
 */
async function logAnalysis(
  databases,
  userId,
  cardId,
  imageId,
  analysisType,
  status,
  resultData,
  processingTime,
  errorMessage,
) {
  try {
    const analysisId = ID.unique();

    // Calculate average confidence if labels exist
    let confidenceScore = null;
    if (resultData?.labels && Array.isArray(resultData.labels)) {
      const confidences = resultData.labels.map((l) => l.confidence || 0);
      confidenceScore =
        confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    await databases.createDocument(
      DATABASE_ID,
      "ai_diagram_analysis",
      analysisId,
      {
        analysis_id: analysisId,
        user_id: userId,
        card_id: cardId,
        image_id: imageId,
        analysis_type: analysisType,
        status,
        result_data: resultData ? JSON.stringify(resultData) : null,
        confidence_score: confidenceScore,
        processing_time: processingTime,
        error_message: errorMessage || null,
        created_at: new Date().toISOString(),
      },
    );
  } catch (err) {
    console.error("Failed to log analysis:", err.message);
    // Don't throw - logging failure shouldn't break the main flow
  }
}
