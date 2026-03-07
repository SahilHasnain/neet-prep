/**
 * Admin Video Management Screen
 * Manage video lessons for all topics
 */

import { THEME_CLASSES } from '@/src/config/theme.config';
import { VideoLesson, videoLessonsService } from '@/src/services/video-lessons.service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminVideosScreen() {
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoLesson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    const allVideos = await videoLessonsService.getAllVideos();
    setVideos(allVideos);
    setLoading(false);
  };

  const handleDelete = (video: VideoLesson) => {
    Alert.alert(
      'Delete Video',
      `Are you sure you want to delete "${video.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await videoLessonsService.deleteVideo(video.$id);
            loadVideos();
          },
        },
      ]
    );
  };

  const handleToggleActive = async (video: VideoLesson) => {
    await videoLessonsService.toggleActive(video.$id, !video.is_active);
    loadVideos();
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.topic_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background-secondary border-b border-border-subtle">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className={THEME_CLASSES.heading2}>Video Management</Text>
        </View>
        <TouchableOpacity
   