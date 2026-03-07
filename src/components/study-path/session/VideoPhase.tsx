import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

interface VideoPhaseProps {
  videoUrl: string;
  onComplete: () => void;
}

export function VideoPhase({ videoUrl, onComplete }: VideoPhaseProps) {
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(false);
  const [loading, setLoading] = useState(true);

  const extractYoutubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const videoId = extractYoutubeId(videoUrl);
  const screenWidth = Dimensions.get('window').width;

  const handleStateChange = (state: string) => {
    if (state === 'ended') {
      setWatched(true);
      setPlaying(false);
    }
  };

  if (!videoId) {
    return (
      <View className="flex-1 justify-center items-center min-h-[400px]">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className={`${THEME_CLASSES.body} mt-4 text-center`}>
          Invalid video URL
        </Text>
        <TouchableOpacity onPress={onComplete} className={`${THEME_CLASSES.buttonPrimary} mt-4`}>
          <Text className="text-white font-bold">Skip Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 min-h-[400px]">
      <View className="bg-accent-primary/10 rounded-xl p-4 mb-4 border border-accent-primary/30">
        <View className="flex-row items-center mb-2">
          <Ionicons name="play-circle" size={24} color="#8b5cf6" />
          <Text className={`${THEME_CLASSES.heading3} ml-2`}>Watch & Learn</Text>
        </View>
        <Text className={THEME_CLASSES.bodySmall}>
          Focus on understanding. You can pause and rewind as needed.
        </Text>
      </View>

      <View className={`${THEME_CLASSES.card} overflow-hidden`}>
        {loading && (
          <View className="absolute inset-0 items-center justify-center z-10 bg-background-secondary">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className={`${THEME_CLASSES.body} mt-2`}>Loading video...</Text>
          </View>
        )}
        
        <YoutubePlayer
          height={(screenWidth - 32) * 9 / 16}
          width={screenWidth - 32}
          videoId={videoId}
          play={playing}
          onChangeState={handleStateChange}
          onReady={() => setLoading(false)}
        />

        <View className="p-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => setPlaying(!playing)}
              className="flex-row items-center bg-accent-primary rounded-lg px-4 py-2"
            >
              <Ionicons name={playing ? 'pause' : 'play'} size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                {playing ? 'Pause' : 'Play'}
              </Text>
            </TouchableOpacity>

            {watched && (
              <View className="flex-row items-center bg-accent-success/20 rounded-lg px-3 py-2">
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text className="text-accent-success text-sm font-semibold ml-1">Watched</Text>
              </View>
            )}
          </View>

          <View className="bg-accent-info/10 rounded-lg p-3 mb-4 border border-accent-info/30">
            <Text className={`${THEME_CLASSES.bodySmall} text-center`}>
              💡 Tip: Take mental notes of key concepts as you watch
            </Text>
          </View>

          <TouchableOpacity
            onPress={onComplete}
            className={`${THEME_CLASSES.buttonPrimary} ${!watched ? 'opacity-50' : ''}`}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" />
            <Text className="text-white font-bold ml-2">
              {watched ? 'Continue to Active Recall' : 'Skip Video (Not Recommended)'}
            </Text>
          </TouchableOpacity>

          {!watched && (
            <Text className="text-text-tertiary text-xs text-center mt-2">
              Watch the full video for better learning outcomes
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
