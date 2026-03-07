/**
 * Hook for managing study paths
 */

import { useEffect, useState } from 'react';
import { getTopicById } from '../config/knowledge-graph.config';
import { StudyPathService } from '../services/study-path.service';
import type { StudyPath, TopicProgress, TopicWithProgress } from '../types/study-path.types';

export function useStudyPath(userId: string) {
  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [topicsWithProgress, setTopicsWithProgress] = useState<TopicWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudyPath = async () => {
    try {
      setLoading(true);
      setError(null);

      const path = await StudyPathService.getUserStudyPath(userId);
      setStudyPath(path);

      if (path) {
        const progress = await StudyPathService.getTopicProgress(path.path_id);
        setTopicProgress(progress);

        // Combine topics with progress
        const combined = path.topic_sequence.map(topicId => {
          const topic = getTopicById(topicId);
          const prog = progress.find(p => p.topic_id === topicId);
          
          if (!topic) return null;

          return {
            ...topic,
            progress: prog,
            isLocked: prog?.status === 'locked',
            dependencyCount: topic.prerequisites.length,
            dependentCount: 0 // Will be calculated
          } as TopicWithProgress;
        }).filter(Boolean) as TopicWithProgress[];

        setTopicsWithProgress(combined);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load study path');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadStudyPath();
    }
  }, [userId]);

  const completeTopic = async (topicId: string) => {
    if (!studyPath) return;

    try {
      await StudyPathService.completeTopic(userId, studyPath.path_id, topicId);
      await loadStudyPath(); // Reload to get updated progress
    } catch (err: any) {
      setError(err.message || 'Failed to complete topic');
    }
  };

  return {
    studyPath,
    topicProgress,
    topicsWithProgress,
    allProgress: topicProgress, // Expose raw progress array
    loading,
    error,
    refresh: loadStudyPath,
    completeTopic
  };
}
