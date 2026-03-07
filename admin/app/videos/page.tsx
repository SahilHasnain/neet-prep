"use client";

import { VideoLesson } from "@/../../shared/types/video.types";
import { TOPICS, getTopicName } from "@/lib/topics";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import { useEffect, useState } from "react";

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoLesson | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    const res = await fetch("/api/videos");
    const data = await res.json();
    setVideos(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    loadVideos();
  };

  const handleToggleActive = async (video: VideoLesson) => {
    await fetch(`/api/videos/${video.$id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !video.is_active }),
    });
    loadVideos();
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.topic_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedVideos = filteredVideos.reduce((acc, video) => {
    if (!acc[video.topic_id]) acc[video.topic_id] = [];
    acc[video.topic_id].push(video);
    return acc;
  }, {} as Record<string, VideoLesson[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[--color-text-secondary]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Video Management</h1>
            <p className="text-[--color-text-secondary]">
              Manage video lessons for all topics
            </p>
          </div>
          <button
            onClick={() => {
              setEditingVideo(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-[--color-accent-primary] text-white rounded-lg hover:bg-[--color-accent-secondary] transition"
          >
            + Add Video
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search videos, topics, or channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-[--color-background-secondary] border border-[--color-border-secondary] rounded-lg focus:outline-none focus:border-[--color-accent-primary]"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[--color-background-secondary] p-4 rounded-lg border border-[--color-border-subtle]">
            <div className="text-2xl font-bold">{videos.length}</div>
            <div className="text-sm text-[--color-text-secondary]">Total Videos</div>
          </div>
          <div className="bg-[--color-background-secondary] p-4 rounded-lg border border-[--color-border-subtle]">
            <div className="text-2xl font-bold text-[--color-accent-success]">
              {videos.filter((v) => v.is_active).length}
            </div>
            <div className="text-sm text-[--color-text-secondary]">Active</div>
          </div>
          <div className="bg-[--color-background-secondary] p-4 rounded-lg border border-[--color-border-subtle]">
            <div className="text-2xl font-bold">{Object.keys(groupedVideos).length}</div>
            <div className="text-sm text-[--color-text-secondary]">Topics Covered</div>
          </div>
        </div>

        {/* Videos by Topic */}
        <div className="space-y-6">
          {Object.entries(groupedVideos).map(([topicId, topicVideos]) => (
            <div
              key={topicId}
              className="bg-[--color-background-secondary] rounded-lg border border-[--color-border-subtle] overflow-hidden"
            >
              <div className="px-6 py-4 bg-[--color-background-tertiary] border-b border-[--color-border-subtle]">
                <h2 className="text-xl font-semibold">{topicId}</h2>
                <p className="text-sm text-[--color-text-secondary]">
                  {topicVideos.length} video{topicVideos.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="divide-y divide-[--color-border-subtle]">
                {topicVideos.map((video) => (
                  <div key={video.$id} className="p-4 hover:bg-[--color-background-tertiary] transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{video.title}</h3>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              video.is_active
                                ? "bg-[--color-accent-success]/20 text-[--color-accent-success]"
                                : "bg-[--color-text-tertiary]/20 text-[--color-text-tertiary]"
                            }`}
                          >
                            {video.is_active ? "Active" : "Inactive"}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[--color-accent-primary]/20 text-[--color-accent-primary] capitalize">
                            {video.difficulty}
                          </span>
                        </div>
                        <div className="text-sm text-[--color-text-secondary] space-y-1">
                          <div>Channel: {video.channel}</div>
                          <div>YouTube ID: {video.youtube_id}</div>
                          <div>Duration: {video.duration} | Language: {video.language}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(video)}
                          className="px-3 py-1.5 text-sm bg-[--color-background-tertiary] hover:bg-[--color-border-secondary] rounded transition"
                        >
                          {video.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingVideo(video);
                            setShowModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-[--color-accent-primary]/20 text-[--color-accent-primary] hover:bg-[--color-accent-primary]/30 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video.$id!)}
                          className="px-3 py-1.5 text-sm bg-[--color-accent-error]/20 text-[--color-accent-error] hover:bg-[--color-accent-error]/30 rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <VideoModal
            video={editingVideo}
            onClose={() => {
              setShowModal(false);
              setEditingVideo(null);
            }}
            onSave={() => {
              setShowModal(false);
              setEditingVideo(null);
              loadVideos();
            }}
          />
        )}
      </div>
    </div>
  );
}

function VideoModal({
  video,
  onClose,
  onSave,
}: {
  video: VideoLesson | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    video_id: video?.video_id || "",
    topic_id: video?.topic_id || "",
    title: video?.title || "",
    channel: video?.channel || "",
    youtube_id: video?.youtube_id || "",
    duration: video?.duration || "",
    description: video?.description || "",
    difficulty: video?.difficulty || "beginner",
    language: video?.language || "english",
    is_active: video?.is_active ?? true,
    order_index: video?.order_index || 0,
  });
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoCount, setVideoCount] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (video?.$id) {
      await fetch(`/api/videos/${video.$id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    
    onSave();
  };

  // Auto-generate video ID when topic changes
  const handleTopicChange = async (topicId: string) => {
    setFormData({ ...formData, topic_id: topicId });
    
    if (!video) {
      // Fetch existing videos for this topic to determine next number
      const res = await fetch(`/api/videos?topicId=${topicId}`);
      const existingVideos = await res.json();
      const nextNumber = existingVideos.length + 1;
      setVideoCount(nextNumber);
      setFormData(prev => ({ 
        ...prev, 
        topic_id: topicId,
        video_id: `${topicId}_v${nextNumber}`,
        order_index: existingVideos.length
      }));
    }
  };

  // Extract YouTube ID from URL
  const handleYoutubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    const extractedId = extractYouTubeId(url);
    if (extractedId) {
      setFormData({ ...formData, youtube_id: extractedId });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[--color-border-secondary]">
        <div className="p-6 border-b border-[--color-border-subtle] bg-[#0a0a0a]">
          <h2 className="text-2xl font-bold">{video ? "Edit Video" : "Add Video"}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject & Topic <span className="text-[--color-accent-error]">*</span>
            </label>
            <select
              required
              value={formData.topic_id}
              onChange={(e) => handleTopicChange(e.target.value)}
              disabled={!!video}
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary] disabled:opacity-50"
            >
              <option value="">Select a topic...</option>
              {Object.entries(TOPICS).map(([subject, topics]) => (
                <optgroup key={subject} label={subject}>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.id} - {topic.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {video && (
              <p className="text-xs text-[--color-text-tertiary] mt-1">
                Topic cannot be changed when editing
              </p>
            )}
          </div>

          {/* Auto-generated Video ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Video ID {!video && <span className="text-[--color-accent-success]">(Auto-generated)</span>}
            </label>
            <input
              type="text"
              required
              value={formData.video_id}
              onChange={(e) => setFormData({ ...formData, video_id: e.target.value })}
              readOnly={!video}
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary] read-only:opacity-70"
              placeholder="Select topic first..."
            />
            {!video && formData.topic_id && (
              <p className="text-xs text-[--color-text-tertiary] mt-1">
                This will be video #{videoCount} for {getTopicName(formData.topic_id)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-[--color-accent-error]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Kinematics - Complete Chapter"
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Channel <span className="text-[--color-accent-error]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              placeholder="e.g., Physics Wallah, Vedantu NEET"
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
            />
          </div>

          {/* YouTube URL with auto-extract */}
          <div>
            <label className="block text-sm font-medium mb-1">
              YouTube URL <span className="text-[--color-accent-error]">*</span>
            </label>
            <input
              type="text"
              required={!formData.youtube_id}
              value={youtubeUrl}
              onChange={(e) => handleYoutubeUrlChange(e.target.value)}
              placeholder="Paste full YouTube URL here..."
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
            />
            <p className="text-xs text-[--color-text-tertiary] mt-1">
              Paste: https://www.youtube.com/watch?v=... or https://youtu.be/...
            </p>
          </div>

          {/* Extracted YouTube ID (read-only) */}
          {formData.youtube_id && (
            <div>
              <label className="block text-sm font-medium mb-1">
                YouTube ID <span className="text-[--color-accent-success]">✓ Extracted</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.youtube_id}
                  readOnly
                  className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded opacity-70"
                />
                {formData.youtube_id && (
                  <img
                    src={getYouTubeThumbnail(formData.youtube_id)}
                    alt="Thumbnail"
                    className="w-20 h-12 object-cover rounded border border-[--color-border-secondary]"
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of what this video covers..."
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration <span className="text-[--color-accent-error]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="25:30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
              />
              <p className="text-xs text-[--color-text-tertiary] mt-1">MM:SS</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[--color-border-secondary] rounded focus:outline-none focus:border-[--color-accent-primary]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-[#0a0a0a] rounded border border-[--color-border-secondary]">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm">
              Active (visible in mobile app)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[--color-accent-primary] text-white rounded-lg hover:bg-[--color-accent-secondary] transition"
            >
              {video ? "Update Video" : "Create Video"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
