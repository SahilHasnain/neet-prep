/**
 * Videos API Route
 */

import { videoService } from "@/lib/video.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topicId = searchParams.get("topicId");

    const videos = topicId
      ? await videoService.getByTopic(topicId)
      : await videoService.getAll();

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const video = await videoService.create(body);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
