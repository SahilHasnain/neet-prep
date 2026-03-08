/**
 * Groq AI Service
 */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function selectBestVideos(
  videos: Array<{
    id: string;
    title: string;
    description: string;
    channelTitle: string;
    duration: string;
    viewCount: number;
  }>,
  topicName: string,
  maxResults: number = 10
): Promise<
  Array<{
    id: string;
    score: number;
    difficulty: "beginner" | "intermediate" | "advanced";
    reasoning: string;
  }>
> {
  // Prepare video list for AI (truncate descriptions to save tokens)
  const videoList = videos.map((v, idx) => ({
    index: idx,
    id: v.id,
    title: v.title,
    channel: v.channelTitle,
    duration: v.duration,
    views: v.viewCount,
    description: v.description.substring(0, 200), // Truncate to save tokens
  }));

  const prompt = `You are an expert educational content curator. Analyze these ${videos.length} Khan Academy YouTube videos about "${topicName}" and select the TOP ${maxResults} BEST videos for students.

IMPORTANT: All videos are from Khan Academy - known for clear, foundational explanations.

VIDEOS:
${JSON.stringify(videoList, null, 2)}

SELECTION CRITERIA (in order of importance):
1. Educational Quality - Clear, step-by-step explanations
2. Topic Relevance - Directly covers the topic concepts
3. Content Depth - Thorough explanation without being overwhelming
4. Video Length - Appropriate duration (5-20 mins ideal for focused learning)
5. Completeness - Covers fundamentals well
6. Popularity - Higher views indicate student preference

RESPOND with ONLY a JSON object in this EXACT format:
{
  "selected": [
    {
      "id": "video_youtube_id",
      "score": 85,
      "difficulty": "beginner",
      "reasoning": "Brief explanation why this video is excellent"
    }
  ]
}

Select the ${maxResults} BEST videos. Prioritize clear foundational content.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content || '{"selected":[]}';
    console.log("[Groq] Batch selection response:", content.substring(0, 200));
    const result = JSON.parse(content);
    
    return result.selected || [];
  } catch (error) {
    console.error("[Groq] Batch video selection failed:", error);
    return [];
  }
}

export async function generateSearchQueries(topicId: string, topicName: string): Promise<string[]> {
  const prompt = `Generate 5 optimal YouTube search queries to find the best Khan Academy educational videos.

Topic ID: ${topicId}
Topic Name: ${topicName}

IMPORTANT: Focus ONLY on Khan Academy channel.

Requirements:
- Include "Khan Academy" in search queries
- Mix of concept explanations, practice problems, and full lessons
- Focus on clear, foundational understanding
- Cover both basic and advanced concepts

Return ONLY a JSON object with this exact format:
{"queries": ["query1", "query2", "query3", "query4", "query5"]}

Example: {"queries": ["${topicName} Khan Academy", "${topicName} Khan Academy basics", "${topicName} Khan Academy practice", "${topicName} Khan Academy explained", "${topicName} Khan Academy tutorial"]}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || '{"queries":[]}';
    console.log("[Groq] Search queries response:", content);
    const result = JSON.parse(content);
    return result.queries || [];
  } catch (error) {
    console.error("[Groq] Search query generation failed:", error);
    // Fallback queries for Khan Academy
    return [
      `${topicName} Khan Academy`,
      `${topicName} Khan Academy basics`,
      `${topicName} Khan Academy practice`,
      `${topicName} Khan Academy explained`,
      `${topicName} Khan Academy tutorial`,
    ];
  }
}

export async function generateVideoDescription(
  title: string,
  originalDescription: string
): Promise<string> {
  const prompt = `Create a concise, student-friendly description (max 150 chars) for this educational video:

Title: ${title}
Original: ${originalDescription.substring(0, 300)}

Make it clear what students will learn. Focus on key concepts covered.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    max_tokens: 100,
  });

  return completion.choices[0].message.content?.trim() || "";
}
