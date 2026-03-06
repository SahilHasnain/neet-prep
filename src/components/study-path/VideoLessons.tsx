import { THEME_CLASSES } from '@/src/config/theme.config';
import { formatDuration, getVideosForTopic, getYouTubeThumbnail, VideoLesson } from '@/src/config/video-lessons.config';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

interface VideoLessonsProps {
  topicId: string;
  topicName: string;
}

export function VideoLessons({ topicId, topicName }: VideoLessonsProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'english' | 'hindi'>('all');
  const [playingVideo, setPlayingVideo] = useState<VideoLesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videos = getVideosForTopic(topicId);

  if (videos.length === 0) {
    return (
      <View className="bg-accent-warning/10 rounded-xl p-4 border border-accent-warning/30">
        <View className="flex-row items-center mb-2">
          <Ionicons name="videocam-off" size={20} color="#f59e0b" />
          <Text className="ml-2 text-accent-warning font-semibold">No Videos Available</Text>
        </View>
        <Text className={THEME_CLASSES.bodySmall}>
          Video lessons for this topic are coming soon. Check back later!
        </Text>
      </View>
    );
  }

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const difficultyMatch = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    const languageMatch = selectedLanguage === 'all' || video.language === selectedLanguage || video.language === 'both';
    return difficultyMatch && languageMatch;
  });

  const handleVideoPress = (video: VideoLesson) => {
    setPlayingVideo(video);
    setIsPlaying(true);
  };

  const handleCloseVideo = () => {
    setIsPlaying(false);
    setPlayingVideo(null);
  };

  return (
    <>
      <View className="bg-accent-primary/10 rounded-xl p-4 border border-accent-primary/30">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-accent-primary/20 items-center justify-center mr-3">
            <Ionicons name="play-circle" size={24} color="#8b5cf6" />
          </View>
          <View className="flex-1">
            <Text className={THEME_CLASSES.heading3}>Video Lessons</Text>
            <Text className={`${THEME_CLASSES.caption} mt-0.5`}>
              {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View className="mb-4">
          {/* Difficulty Filter */}
          <Text className={`${THEME_CLASSES.bodySmall} mb-2`}>Difficulty:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
            <View className="flex-row gap-2">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(diff => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-full ${
                    selectedDifficulty === diff
                      ? 'bg-accent-primary'
                      : 'bg-background-secondary border border-border-subtle'
                  }`}
                >
                  <Text className={`text-xs font-medium capitalize ${
                    selectedDifficulty === diff ? 'text-white' : 'text-text-secondary'
                  }`}>
                    {diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Language Filter */}
          <Text className={`${THEME_CLASSES.bodySmall} mb-2`}>Language:</Text>
          <View className="flex-row gap-2">
            {(['all', 'english', 'hindi'] as const).map(lang => (
              <TouchableOpacity
                key={lang}
                onPress={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-full ${
                  selectedLanguage === lang
                    ? 'bg-accent-primary'
                    : 'bg-background-secondary border border-border-subtle'
                }`}
              >
                <Text className={`text-xs font-medium capitalize ${
                  selectedLanguage === lang ? 'text-white' : 'text-text-secondary'
                }`}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Video List */}
        {filteredVideos.length === 0 ? (
          <View className="py-6 items-center">
            <Ionicons name="search-outline" size={32} color="#717171" />
            <Text className={`${THEME_CLASSES.bodySmall} mt-2 text-center`}>
              No videos match your filters
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {filteredVideos.map(video => (
              <TouchableOpacity
                key={video.id}
                onPress={() => handleVideoPress(video)}
                className="bg-background-secondary rounded-lg overflow-hidden border border-border-secondary active:bg-background-tertiary"
              >
                {/* Thumbnail */}
                <View className="relative">
                  <Image
                    source={{ uri: getYouTubeThumbnail(video.youtubeId, 'medium') }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  {/* Play Button Overlay */}
                  <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <View className="w-16 h-16 rounded-full bg-white/90 items-center justify-center">
                      <Ionicons name="play" size={32} color="#8b5cf6" style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                  {/* Duration Badge */}
                  <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-semibold">{video.duration}</Text>
                  </View>
                </View>

                {/* Video Info */}
                <View className="p-3">
                  <Text className={`${THEME_CLASSES.heading3} mb-1`} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text className={`${THEME_CLASSES.caption} mb-2`}>
                    {video.channel} • {formatDuration(video.duration)}
                  </Text>
                  <Text className={`${THEME_CLASSES.bodySmall} mb-2`} numberOfLines={2}>
                    {video.description}
                  </Text>
                  
                  {/* Tags */}
                  <View className="flex-row gap-2">
                    <View className={`px-2 py-0.5 rounded ${
                      video.difficulty === 'beginner' ? 'bg-accent-success/20' :
                      video.difficulty === 'intermediate' ? 'bg-accent-warning/20' :
                      'bg-accent-error/20'
                    }`}>
                      <Text className={`text-xs capitalize ${
                        video.difficulty === 'beginner' ? 'text-accent-success' :
                        video.difficulty === 'intermediate' ? 'text-accent-warning' :
                        'text-accent-error'
                      }`}>
                        {video.difficulty}
                      </Text>
                    </View>
                    <View className="px-2 py-0.5 rounded bg-accent-primary/20">
                      <Text className="text-xs text-accent-primary capitalize">
                        {video.language}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Note */}
        <View className="mt-4 p-3 bg-background-tertiary rounded-lg border border-border-subtle">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={16} color="#717171" style={{ marginTop: 2 }} />
            <Text className={`${THEME_CLASSES.caption} ml-2 flex-1`}>
              Tap any video to watch it in full screen. Videos are streamed from YouTube.
            </Text>
          </View>
        </View>
      </View>

      {/* Video Player Modal */}
      <Modal
        visible={playingVideo !== null}
        animationType="slide"
        onRequestClose={handleCloseVideo}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View className="flex-1 bg-background-primary">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 bg-background-secondary border-b border-border-subtle">
            <View className="flex-1 mr-4">
              <Text className={THEME_CLASSES.heading3} numberOfLines={1}>
                {playingVideo?.title}
              </Text>
              <Text className={THEME_CLASSES.caption}>
                {playingVideo?.channel}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCloseVideo}
              className="w-10 h-10 items-center justify-center rounded-full bg-background-tertiary"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Video Player */}
          <View className="flex-1 bg-black">
            {playingVideo && (
              <YoutubePlayer
                height={300}
                play={isPlaying}
                videoId={playingVideo.youtubeId}
                onChangeState={(state: string) => {
                  if (state === 'ended') {
                    setIsPlaying(false);
                  }
                }}
              />
            )}
          </View>

          {/* Video Details */}
          <ScrollView className="flex-1 p-4">
            <View className="mb-4">
              <Text className={`${THEME_CLASSES.heading2} mb-2`}>
                {playingVideo?.title}
              </Text>
              <Text className={`${THEME_CLASSES.body} mb-3`}>
                {playingVideo?.description}
              </Text>
              
              {/* Meta Info */}
              <View className="flex-row flex-wrap gap-2">
                <View className="flex-row items-center bg-background-secondary px-3 py-1.5 rounded-full">
                  <Ionicons name="time-outline" size={16} color="#717171" />
                  <Text className={`${THEME_CLASSES.caption} ml-1`}>
                    {playingVideo?.duration}
                  </Text>
                </View>
                <View className={`px-3 py-1.5 rounded-full ${
                  playingVideo?.difficulty === 'beginner' ? 'bg-accent-success/20' :
                  playingVideo?.difficulty === 'intermediate' ? 'bg-accent-warning/20' :
                  'bg-accent-error/20'
                }`}>
                  <Text className={`text-xs capitalize ${
                    playingVideo?.difficulty === 'beginner' ? 'text-accent-success' :
                    playingVideo?.difficulty === 'intermediate' ? 'text-accent-warning' :
                    'text-accent-error'
                  }`}>
                    {playingVideo?.difficulty}
                  </Text>
                </View>
                <View className="px-3 py-1.5 rounded-full bg-accent-primary/20">
                  <Text className="text-xs text-accent-primary capitalize">
                    {playingVideo?.language}
                  </Text>
                </View>
              </View>
            </View>

            {/* Channel Info */}
            <View className="bg-background-secondary rounded-lg p-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-accent-primary/20 items-center justify-center mr-3">
                  <Ionicons name="person" size={24} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className={THEME_CLASSES.heading3}>
                    {playingVideo?.channel}
                  </Text>
                  <Text className={THEME_CLASSES.caption}>
                    Educational Content Creator
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
