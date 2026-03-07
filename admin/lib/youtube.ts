/**
 * YouTube URL utilities
 */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // If it's already just an ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }
  
  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
