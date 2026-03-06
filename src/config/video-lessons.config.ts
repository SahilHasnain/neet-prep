/**
 * Video Lessons Configuration
 * Curated NEET video content for each topic
 */

export interface VideoLesson {
  id: string;
  title: string;
  channel: string;
  duration: string; // e.g., "15:30"
  youtubeId: string; // YouTube video ID
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'english' | 'hindi' | 'both';
}

export interface TopicVideos {
  topicId: string;
  videos: VideoLesson[];
}

// Video lessons mapped to topic IDs
export const VIDEO_LESSONS: TopicVideos[] = [
  // Physics Topics
  {
    topicId: 'phy_001',
    videos: [
      {
        id: 'phy_001_v1',
        title: 'Units and Measurements - Complete Chapter',
        channel: 'Physics Wallah',
        duration: '45:20',
        youtubeId: 'dQw4w9WgXcQ', // Replace with actual video IDs
        description: 'Complete coverage of units, dimensions, and significant figures for NEET',
        difficulty: 'beginner',
        language: 'hindi'
      },
      {
        id: 'phy_001_v2',
        title: 'Dimensional Analysis Tricks',
        channel: 'Vedantu NEET',
        duration: '22:15',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Quick tricks and shortcuts for dimensional analysis problems',
        difficulty: 'intermediate',
        language: 'english'
      }
    ]
  },
  {
    topicId: 'phy_002',
    videos: [
      {
        id: 'phy_002_v1',
        title: 'Kinematics - Motion in Straight Line',
        channel: 'Unacademy NEET',
        duration: '38:45',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Complete kinematics with graphs and problem solving',
        difficulty: 'beginner',
        language: 'hindi'
      }
    ]
  },
  {
    topicId: 'phy_008',
    videos: [
      {
        id: 'phy_008_v1',
        title: 'Thermodynamics Complete Chapter',
        channel: 'Physics Wallah',
        duration: '52:30',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Laws of thermodynamics, heat engines, and entropy',
        difficulty: 'intermediate',
        language: 'hindi'
      }
    ]
  },
  
  // Chemistry Topics
  {
    topicId: 'chem_001',
    videos: [
      {
        id: 'chem_001_v1',
        title: 'Basic Concepts of Chemistry',
        channel: 'Vedantu NEET',
        duration: '35:20',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Mole concept, stoichiometry, and chemical calculations',
        difficulty: 'beginner',
        language: 'english'
      }
    ]
  },
  {
    topicId: 'chem_005',
    videos: [
      {
        id: 'chem_005_v1',
        title: 'Chemical Thermodynamics',
        channel: 'Unacademy NEET',
        duration: '48:15',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Enthalpy, entropy, and Gibbs free energy',
        difficulty: 'intermediate',
        language: 'hindi'
      }
    ]
  },
  
  // Biology Topics
  {
    topicId: 'bio_001',
    videos: [
      {
        id: 'bio_001_v1',
        title: 'Living World and Classification',
        channel: 'Biology by Shubham Pathak',
        duration: '42:10',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Complete taxonomy and classification for NEET',
        difficulty: 'beginner',
        language: 'hindi'
      }
    ]
  },
  {
    topicId: 'bio_005',
    videos: [
      {
        id: 'bio_005_v1',
        title: 'Mendelian Genetics Complete',
        channel: 'Vedantu NEET Biology',
        duration: '55:30',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Laws of inheritance, monohybrid and dihybrid crosses',
        difficulty: 'intermediate',
        language: 'english'
      }
    ]
  }
];

// Helper function to get videos for a topic
export function getVideosForTopic(topicId: string): VideoLesson[] {
  const topicVideos = VIDEO_LESSONS.find(tv => tv.topicId === topicId);
  return topicVideos?.videos || [];
}

// Helper function to get YouTube thumbnail URL
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

// Helper function to get YouTube watch URL
export function getYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// Helper function to format duration
export function formatDuration(duration: string): string {
  const parts = duration.split(':');
  if (parts.length === 2) {
    return `${parts[0]}m ${parts[1]}s`;
  } else if (parts.length === 3) {
    return `${parts[0]}h ${parts[1]}m`;
  }
  return duration;
}
