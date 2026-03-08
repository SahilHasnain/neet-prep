/**
 * AI Video Suggestions API
 * Returns AI-curated video suggestions for manual review (BATCH APPROACH)
 */

import { NextRequest, NextResponse } from "next/server";
import { generateSearchQueries, selectBestVideos } from "../../../lib/groq";
import { getTopicName } from "../../../lib/topics";
import { searchVideos } from "../../../lib/youtube-api";

export async function POST(request: NextRequest) {
  try {
    const { topicId } = await request.json();

    if (!topicId) {
      return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
    }

    const topicName = getTopicName(topicId);
    console.log(`[AI-Suggest] Starting for topic: ${topicId} - ${topicName}`);
    
    // Step 1: AI generates search queries
    console.log(`[AI-Suggest] Generating search queries...`);
    const searchQueries = await generateSearchQueries(topicId, topicName);
    console.log(`[AI-Suggest] Generated queries:`, searchQueries);
    
    // Step 2: Search YouTube
    console.log(`[AI-Suggest] Searching YouTube...`);
    const allVideos = [];
    for (const query of searchQueries) {
      const videos = await searchVideos(query, 20); // Increased from 15 to 20
      console.log(`[AI-Suggest] Query "${query}" found ${videos.length} videos`);
      allVideos.push(...videos);
    }

    // Remove duplicates
    const uniqueVideos = Array.from(
      new Map(allVideos.map((v) => [v.id, v])).values()
    );
    console.log(`[AI-Suggest] Total unique videos: ${uniqueVideos.length}`);

    if (uniqueVideos.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        searchQueries,
        message: "No videos found. Try a different topic or check YouTube API key.",
      });
    }

    // Step 3: AI batch selection (ONE call instead of N calls)
    console.log(`[AI-Suggest] AI selecting best videos from ${uniqueVideos.length} candidates...`);
    const selectedVideos = await selectBestVideos(uniqueVideos, topicName, 10);
    console.log(`[AI-Suggest] AI selected ${selectedVideos.length} videos`);

    // Step 4: Merge AI selection with video data
    const suggestions = selectedVideos
      .map((selection) => {
        const video = uniqueVideos.find((v) => v.id === selection.id);
        if (!video) return null;
        return {
          ...video,
          score: selection.score,
          difficulty: selection.difficulty,
          reasoning: selection.reasoning,
          isEducational: true,
        };
      })
      .filter(Boolean);

    console.log(`[AI-Suggest] Final suggestions: ${suggestions.length}`);

    return NextResponse.json({
      success: true,
      suggestions,
      searchQueries,
      stats: {
        searched: uniqueVideos.length,
        selected: suggestions.length,
      },
    });
  } catch (error: any) {
    console.error("[AI-Suggest] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}
