/**
 * YouTube Data API v3 Service
 */

import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Trusted NEET coaching channels
const TRUSTED_CHANNELS = {
  "Khan Academy": "UC4a-Gbdw7vOaccHmFo40b9g",
  "Khan Academy India": "UCxqAWLTk1CmBvZFPzeZMd9A",
};

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  duration: string;
  thumbnailUrl: string;
  viewCount: number;
  publishedAt: string;
}

export async function searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
  try {
    console.log(`[YouTube API] Searching for: "${query}"`);
    
    const searchResponse = await youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults: maxResults * 2, // Fetch more to account for filtering
      videoDuration: "medium", // 4-20 minutes
      relevanceLanguage: "en",
      safeSearch: "strict",
    });

    console.log(`[YouTube API] Search returned ${searchResponse.data.items?.length || 0} results`);

    const videoIds = searchResponse.data.items?.map((item) => item.id?.videoId).filter(Boolean) || [];

    if (videoIds.length === 0) {
      console.log("[YouTube API] No video IDs found");
      return [];
    }

    // Get detailed video info
    const videosResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails", "statistics"],
      id: videoIds as string[],
    });

    console.log(`[YouTube API] Got details for ${videosResponse.data.items?.length || 0} videos`);

    const allVideos = videosResponse.data.items?.map((item) => ({
      id: item.id!,
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      channelTitle: item.snippet?.channelTitle || "",
      channelId: item.snippet?.channelId || "",
      duration: parseDuration(item.contentDetails?.duration || ""),
      thumbnailUrl: item.snippet?.thumbnails?.medium?.url || "",
      viewCount: parseInt(item.statistics?.viewCount || "0"),
      publishedAt: item.snippet?.publishedAt || "",
    })) || [];

    // Filter: Only keep videos from trusted channels
    const trustedChannelIds = Object.values(TRUSTED_CHANNELS);
    const filteredVideos = allVideos.filter((video) => 
      trustedChannelIds.includes(video.channelId) ||
      Object.keys(TRUSTED_CHANNELS).some(name => 
        video.channelTitle.toLowerCase().includes(name.toLowerCase())
      )
    );

    console.log(`[YouTube API] Filtered to ${filteredVideos.length} videos from trusted channels`);

    return filteredVideos.slice(0, maxResults);
  } catch (error: any) {
    console.error("[YouTube API] Error:", error.message);
    if (error.response) {
      console.error("[YouTube API] Response:", error.response.data);
    }
    return [];
  }
}

function parseDuration(isoDuration: string): string {
  // Convert ISO 8601 duration (PT15M30S) to MM:SS format
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
