/**
 * Guided Study Session Component
 * 25-minute Pomodoro-style structured learning sessions
 */

import { THEME_CLASSES } from '@/src/config/theme.config';
import type { QuizQuestion } from '@/src/hooks/useGuidedSession';
import { useGuidedSession } from '@/src/hooks/useGuidedSession';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ActiveRecallPhase } from './session/ActiveRecallPhase';
import { ConfidenceRating } from './session/ConfidenceRating';
import { ReviewPhase } from './session/ReviewPhase';
import { SessionIntro } from './session/SessionIntro';
import { VideoPhase } from './session/VideoPhase';

interface GuidedStudySessionProps {
  visible: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  subject: string;
  videoUrl?: string; // Pass video URL directly instead of navigation
  generateQuestions: () => Promise<QuizQuestion[]>;
  onSessionComplete: (masteryGained: number, timeSpent: number) => void;
}

export function GuidedStudySession({
  visible,
  onClose,
  topicId,
  topicName,
  subject,
  videoUrl,
  generateQuestions,
  onSessionComplete
}: GuidedStudySessionProps) {
  const {
    phase,
    setPhase,
    timeRemaining,
    setTimeRemaining,
    isPaused,
    setIsPaused,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    selectedConfidence,
    showExplanation,
    answers,
    loadingQuiz,
    handleStartSession,
    handleVideoComplete,
    handleActiveRecallComplete,
    handleSelectAnswer,
    handleSelectConfidence,
    handleSubmitAnswer,
    handleNextQuestion,
    handleCompleteSession,
    resetSession
  } = useGuidedSession(generateQuestions, onSessionComplete);

  // Timer logic
  useEffect(() => {
    if (!visible || isPaused || phase === 'intro' || phase === 'complete') return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, isPaused, phase]);

  const handleTimeUp = () => {
    Alert.alert(
      'Session Time Up!',
      'Great effort! Take a 5-minute break before your next session.',
      [{ text: 'OK', onPress: handleCompleteSession }]
    );
  };

  const handleClose = () => {
    if (phase !== 'intro' && phase !== 'complete') {
      Alert.alert(
        'Exit Session?',
        'Your progress will be lost. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: resetAndClose }
        ]
      );
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    resetSession();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseProgress = () => {
    switch (phase) {
      case 'intro': return 0;
      case 'video': return 20;
      case 'active-recall': return 40;
      case 'quiz': return 60;
      case 'review': return 80;
      case 'complete': return 100;
      default: return 0;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-background-primary">
        {/* Header */}
        <View className="bg-accent-primary px-4 pt-12 pb-4">
          <View className="flex-row items-center justify-between mb-2">
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Guided Study Session</Text>
            {phase !== 'intro' && phase !== 'complete' && (
              <TouchableOpacity onPress={() => setIsPaused(!isPaused)} className="p-2">
                <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {(phase === 'intro' || phase === 'complete') && <View className="w-10" />}
          </View>
          
          <Text className="text-white/90 text-center text-sm mb-3">{topicName}</Text>
          
          {phase !== 'intro' && phase !== 'complete' && (
            <View className="flex-row items-center justify-center space-x-6">
              <View className="flex-row items-center">
                <Ionicons name="time" size={18} color="#fff" />
                <Text className="text-white font-bold ml-1">{formatTime(timeRemaining)}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text className="text-white ml-1">{getPhaseProgress()}% Complete</Text>
              </View>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {phase !== 'intro' && (
          <View className="h-1 bg-background-secondary">
            <View 
              className="h-full bg-accent-success"
              style={{ width: `${getPhaseProgress()}%` }}
            />
          </View>
        )}

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          {phase === 'intro' && <SessionIntro onStart={handleStartSession} />}
          
          {phase === 'video' && videoUrl && (
            <VideoPhase videoUrl={videoUrl} onComplete={handleVideoComplete} />
          )}
          
          {phase === 'video' && !videoUrl && (
            <View className="flex-1 justify-center items-center min-h-[400px]">
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text className={`${THEME_CLASSES.body} mt-4 text-center`}>
                No video available for this topic
              </Text>
              <TouchableOpacity
                onPress={handleVideoComplete}
                className={`${THEME_CLASSES.buttonPrimary} mt-4`}
              >
                <Text className="text-white font-bold">Skip to Active Recall</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {phase === 'active-recall' && (
            <ActiveRecallPhase
              topicName={topicName}
              onComplete={handleActiveRecallComplete}
              onReviewVideo={() => setPhase('video')}
            />
          )}
          
          {phase === 'quiz' && (
            <View className="flex-1 pb-6">
              {loadingQuiz ? (
                <View className="flex-1 justify-center items-center min-h-[400px]">
                  <ActivityIndicator size="large" color="#8b5cf6" />
                  <Text className={`${THEME_CLASSES.body} mt-4`}>Generating quiz...</Text>
                </View>
              ) : (
                <View>
                  <View className="bg-accent-success/10 rounded-xl p-4 mb-4 border border-accent-success/30">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className={THEME_CLASSES.heading3}>Quick Knowledge Check</Text>
                      <Text className={`${THEME_CLASSES.body} font-bold`}>
                        {currentQuestionIndex + 1}/{questions.length}
                      </Text>
                    </View>
                    <Text className={THEME_CLASSES.bodySmall}>
                      Answer these questions to test your understanding
                    </Text>
                  </View>

                  {questions[currentQuestionIndex] && (
                    <View className={THEME_CLASSES.card}>
                      <Text className={`${THEME_CLASSES.body} font-semibold mb-4`}>
                        {questions[currentQuestionIndex].question}
                      </Text>

                      <View className="space-y-3 mb-4">
                        {questions[currentQuestionIndex].options.map((option, index) => {
                          const isSelected = selectedAnswer === index;
                          const isCorrect = index === questions[currentQuestionIndex].correctAnswer;
                          const showCorrect = showExplanation && isCorrect;
                          const showWrong = showExplanation && isSelected && !isCorrect;

                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() => handleSelectAnswer(index)}
                              disabled={showExplanation}
                              className={`p-4 rounded-xl border-2 ${
                                showCorrect ? 'bg-accent-success/20 border-accent-success' :
                                showWrong ? 'bg-accent-error/20 border-accent-error' :
                                isSelected ? 'bg-accent-primary/20 border-accent-primary' :
                                'bg-background-secondary border-border-secondary'
                              }`}
                            >
                              <View className="flex-row items-center">
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                                  showCorrect ? 'border-accent-success bg-accent-success' :
                                  showWrong ? 'border-accent-error bg-accent-error' :
                                  isSelected ? 'border-accent-primary bg-accent-primary' :
                                  'border-text-tertiary'
                                }`}>
                                  {(isSelected || showCorrect) && (
                                    <Ionicons 
                                      name={showCorrect ? 'checkmark' : showWrong ? 'close' : 'checkmark'} 
                                      size={14} 
                                      color="#fff" 
                                    />
                                  )}
                                </View>
                                <Text className={`flex-1 ${THEME_CLASSES.body}`}>{option}</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {selectedAnswer !== null && !showExplanation && (
                        <ConfidenceRating
                          selectedConfidence={selectedConfidence}
                          onSelect={handleSelectConfidence}
                        />
                      )}

                      {showExplanation && (
                        <View className="bg-accent-info/10 rounded-xl p-4 mb-4 border border-accent-info/30">
                          <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle" size={20} color="#3b82f6" />
                            <Text className="text-accent-info font-semibold ml-2">Explanation</Text>
                          </View>
                          <Text className={THEME_CLASSES.bodySmall}>
                            {questions[currentQuestionIndex].explanation}
                          </Text>
                        </View>
                      )}

                      {!showExplanation ? (
                        <TouchableOpacity
                          onPress={handleSubmitAnswer}
                          disabled={selectedAnswer === null || selectedConfidence === null}
                          className={`rounded-xl p-4 items-center ${
                            selectedAnswer === null || selectedConfidence === null
                              ? 'bg-text-disabled' 
                              : 'bg-accent-success'
                          }`}
                        >
                          <Text className="text-white font-semibold">
                            {selectedAnswer === null ? 'Select an Answer' : 
                             selectedConfidence === null ? 'Rate Your Confidence' : 
                             'Submit Answer'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={handleNextQuestion}
                          className="bg-accent-primary rounded-xl p-4 items-center"
                        >
                          <Text className="text-white font-semibold">
                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Continue'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          
          {phase === 'review' && (
            <ReviewPhase
              answers={answers}
              totalQuestions={questions.length}
              onComplete={handleCompleteSession}
            />
          )}
          
          {phase === 'complete' && (
            <View className="flex-1 justify-center items-center min-h-[600px]">
              <View className="bg-accent-success/10 rounded-full p-8 mb-6">
                <Ionicons name="trophy" size={64} color="#10b981" />
              </View>
              
              <Text className={`${THEME_CLASSES.heading1} mb-3 text-center`}>
                Session Complete!
              </Text>
              <Text className={`${THEME_CLASSES.body} text-center mb-8 px-6`}>
                Great work! Take a 5-minute break before your next session.
              </Text>

              <View className="w-full max-w-md bg-background-secondary rounded-xl p-6 mb-6">
                <Text className={`${THEME_CLASSES.heading3} mb-4 text-center`}>
                  Session Stats
                </Text>
                <View className="space-y-3">
                  <View className="flex-row justify-between">
                    <Text className={THEME_CLASSES.body}>Quiz Score</Text>
                    <Text className={`${THEME_CLASSES.body} font-bold text-accent-success`}>
                      {Math.round((answers.filter(a => a.isCorrect).length / questions.length) * 100)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={THEME_CLASSES.body}>Time Spent</Text>
                    <Text className={`${THEME_CLASSES.body} font-bold`}>
                      {formatTime(25 * 60 - timeRemaining)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className={THEME_CLASSES.body}>Mastery Gained</Text>
                    <Text className={`${THEME_CLASSES.body} font-bold text-accent-primary`}>
                      +{Math.round((answers.filter(a => a.isCorrect).length / questions.length) * 100 / 3)}%
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={resetAndClose}
                className={`${THEME_CLASSES.buttonPrimary} w-full max-w-md`}
              >
                <Text className="text-white font-bold">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
