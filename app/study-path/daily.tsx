import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getTopicById } from '../../src/config/knowledge-graph.config';
import { StudyPathService } from '../../src/services/study-path.service';
import type { DailyTask } from '../../src/types/study-path.types';
import { getOrCreateUserId } from '../../src/utils/user-id';
import { getTaskTypeColor, THEME_CLASSES } from '@/src/config/theme.config';

export default function DailyTasksScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    getOrCreateUserId().then(setUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      loadTasks();
      loadStats();
    }
  }, [userId, selectedDate]);

  const loadTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const dailyTasks = await StudyPathService.getDailyTasks(userId, selectedDate);
      setTasks(dailyTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!userId) return;
    try {
      const path = await StudyPathService.getUserStudyPath(userId);
      if (path) {
        const taskStats = await StudyPathService.getTaskStats(userId, path.path_id);
        setStats(taskStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await StudyPathService.completeTask(taskId);
      loadTasks();
      loadStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'study': return 'book';
      case 'practice': return 'create';
      case 'review': return 'refresh';
      case 'quiz': return 'help-circle';
      default: return 'checkmark-circle';
    }
  };

  const getTaskColorClasses = (type: string) => {
    const color = getTaskTypeColor(type as any);
    switch (type) {
      case 'study': return { bg: 'bg-accent-primary/20', text: 'text-accent-primary', icon: '#8b5cf6' };
      case 'practice': return { bg: 'bg-accent-success/20', text: 'text-accent-success', icon: '#10b981' };
      case 'review': return { bg: 'bg-accent-info/20', text: 'text-accent-info', icon: '#06b6d4' };
      case 'quiz': return { bg: 'bg-accent-warning/20', text: 'text-accent-warning', icon: '#f59e0b' };
      default: return { bg: 'bg-background-tertiary', text: 'text-text-tertiary', icon: '#717171' };
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  return (
    <ScrollView className={THEME_CLASSES.screen}>
      <View className={THEME_CLASSES.section}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className={THEME_CLASSES.heading2}>Daily Tasks</Text>
          <View className="w-6" />
        </View>

        {/* Stats Card */}
        {stats && (
          <View className={`${THEME_CLASSES.cardGradient} mb-6`}>
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white text-sm mb-1">Current Streak</Text>
                <View className="flex-row items-center">
                  <Ionicons name="flame" size={32} color="#fbbf24" />
                  <Text className="text-white text-3xl font-bold ml-2">{stats.streak}</Text>
                  <Text className="text-white/70 text-lg ml-1">days</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white text-sm mb-1">Completion Rate</Text>
                <Text className="text-white text-3xl font-bold">{stats.completionRate}%</Text>
              </View>
            </View>
            <View className="flex-row justify-between pt-4 border-t border-white/20">
              <View>
                <Text className="text-white/70 text-xs">Completed</Text>
                <Text className="text-white text-lg font-semibold">{stats.completedTasks}</Text>
              </View>
              <View>
                <Text className="text-white/70 text-xs">Pending</Text>
                <Text className="text-white text-lg font-semibold">{stats.pendingTasks}</Text>
              </View>
              <View>
                <Text className="text-white/70 text-xs">Total</Text>
                <Text className="text-white text-lg font-semibold">{stats.totalTasks}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Date Selector */}
        <View className={`${THEME_CLASSES.card} mb-4`}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 1);
                setSelectedDate(newDate);
              }}
              className="p-2"
            >
              <Ionicons name="chevron-back" size={24} color="#8b5cf6" />
            </TouchableOpacity>
            
            <View className="items-center">
              <Text className={THEME_CLASSES.heading3}>
                {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <Text className={THEME_CLASSES.caption}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 1);
                setSelectedDate(newDate);
              }}
              className="p-2"
            >
              <Ionicons name="chevron-forward" size={24} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress for selected day */}
        {totalTasks > 0 && (
          <View className={`${THEME_CLASSES.card} mb-4`}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className={THEME_CLASSES.bodySmall}>
                {isToday ? "Today's Progress" : "Day Progress"}
              </Text>
              <Text className={`${THEME_CLASSES.bodySmall} font-bold`}>
                {completedTasks}/{totalTasks}
              </Text>
            </View>
            <View className={THEME_CLASSES.progressBar}>
              <View 
                className={THEME_CLASSES.progressFill}
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </View>
          </View>
        )}

        {/* Tasks List */}
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className={`${THEME_CLASSES.body} mt-2`}>Loading tasks...</Text>
          </View>
        ) : tasks.length === 0 ? (
          <View className={`${THEME_CLASSES.card} items-center`}>
            <Ionicons name="calendar-outline" size={48} color="#525252" />
            <Text className={`${THEME_CLASSES.body} mt-3 text-center`}>
              No tasks scheduled for this day
            </Text>
          </View>
        ) : (
          <View>
            <Text className={`${THEME_CLASSES.heading3} mb-3`}>
              {isToday ? "Today's Tasks" : "Tasks"}
            </Text>
            {tasks.map(task => {
              const topic = getTopicById(task.topic_id);
              const isCompleted = task.status === 'completed';
              const taskColors = getTaskColorClasses(task.task_type);
              
              return (
                <View
                  key={task.task_id}
                  className={`${THEME_CLASSES.card} mb-3 ${isCompleted ? 'opacity-60' : ''}`}
                >
                  <View className="flex-row items-start">
                    {/* Checkbox */}
                    <TouchableOpacity
                      onPress={() => !isCompleted && handleCompleteTask(task.task_id)}
                      disabled={isCompleted}
                      className="mr-3 mt-1"
                    >
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isCompleted ? 'bg-accent-success border-accent-success' : 'border-border-primary'
                      }`}>
                        {isCompleted && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Task Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <View className={`px-2 py-1 rounded ${taskColors.bg}`}>
                          <Text className={`text-xs font-semibold capitalize ${taskColors.text}`}>
                            {task.task_type}
                          </Text>
                        </View>
                        <Text className={`${THEME_CLASSES.caption} ml-2`}>
                          {task.estimated_minutes} min
                        </Text>
                      </View>
                      
                      <Text className={`text-base font-semibold mb-1 ${
                        isCompleted ? 'line-through text-text-disabled' : 'text-text-primary'
                      }`}>
                        {topic?.name || task.topic_id}
                      </Text>
                      
                      {task.description && (
                        <Text className={THEME_CLASSES.bodySmall}>
                          {task.description}
                        </Text>
                      )}
                    </View>

                    {/* Icon */}
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${taskColors.bg}`}>
                      <Ionicons 
                        name={getTaskIcon(task.task_type) as any} 
                        size={20} 
                        color={taskColors.icon}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
