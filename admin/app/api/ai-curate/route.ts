/**
 * AI Video Curation API
 * Automatically finds and curates educational videos using YouTube API + Groq AI
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeVideoForEducation, generateSearchQueries, generateVideoDescription } from "../../../lib/groq";
import { getTopicName } from "../../../lib/topics";
import { videoService } from "../../../lib/video.service";
import { searchVideos } from "../../../lib/youtube-api";

export async function POST(request: NextRequest) {
  try {
    const { topicId } = await request.json();

    if (!topicId) {
      return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
    }

    const topicName = getTopicName(topicId);
    
    // Step 1: AI generates optimal search queries
    console.log(`🤖 AI generating search queries for ${topicName}...`);
    const searchQueries = await generateSearchQueries(topicId, topicName);
    
    // Step 2: Search YouTube for each query
    console.log(`🔍 Searching YouTube with ${searchQueries.length} queries...`);
    const allVideos = [];
    for (const query of searchQueries) {
      const videos = await searchVideos(query, 15);
      allVideos.push(...videos);
    }

    // Remove duplicates
    const uniqueVideos = Array.from(
      new Map(allVideos.map((v) => [v.id, v])).values()
    );

    console.log(`📹 Found ${uniqueVideos.length} unique videos`);

    // Step 3: AI analyzes each video
    console.log(`🧠 AI analyzing videos for educational quality...`);
    const analyzedVideos = await Promise.all(
      uniqueVideos.map(async (video) => {
        const analysis = await analyzeVideoForEducation({
          title: video.title,
          description: video.description,
          channelTitle: video.channelTitle,
          duration: video.duration,
          viewCount: video.viewCount,
        });
        return { ...video, ...analysis };
      })
    );

    // Step 4: Filter and sort by AI score
    const educationalVideos = analyzedVideos
      .filter((v) => v.isEducational && v.score >= 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 videos

    console.log(`✅ AI selected ${educationalVideos.length} high-quality videos`);

    // Step 5: Get existing videos count for order_index
    const existingVideos = await videoService.getByTopic(topicId);
    let orderIndex = existingVideos.length;

    // Step 6: Generate descriptions and save to database
    const savedVideos = [];
    for (const video of educationalVideos) {
      const aiDescription = await generateVideoDescription(video.title, video.description);
      
      const videoData = {
        video_id: `${topicId}_v${orderIndex + 1}`,
        topic_id: topicId,
        title: video.title,
        channel: video.channelTitle,
        youtube_id: video.id,
        duration: video.duration,
        description: aiDescription,
        difficulty: video.difficulty,
        language: "english" as const,
        is_active: true,
        order_index: orderIndex,
      };

      const saved = await videoService.create(videoData);
      savedVideos.push({
        ...saved,
        aiScore: video.score,
        aiReasoning: video.reasoning,
      });
      
      orderIndex++;
    }

    return NextResponse.json({
      success: true,
      message: `AI curated and added ${savedVideos.length} videos for ${topicName}`,
      videos: savedVideos,
      searchQueries,
      stats: {
        totalSearched: uniqueVideos.length,
        analyzed: analyzedVideos.length,
        selected: educationalVideos.length,
        saved: savedVideos.length,
      },
    });
  } catch (error: any) {
    console.error("AI curation error:", error);
    return NextResponse.json(
      { error: error.message || "AI curation failed" },
      { status: 500 }
    );
  }
}
