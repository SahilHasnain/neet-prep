import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface InteractiveQuizProps {
  topicId: string;
  topicName: string;
  subject: string;
  onComplete: (score: number, totalQuestions: number, timeSpent: number) => void;
  generateQuestions: () => Promise<QuizQuestion[]>;
}

export function InteractiveQuiz({ 
  topicId, 
  topicName, 
  subject, 
  onComplete,
  generateQuestions 
}: InteractiveQuizProps) {
  const [quizState, setQuizState] = useState<'idle' | 'loading' | 'active' | 'review'>('idle');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (quizState === 'active') {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizState, startTime]);

  const handleStartQuiz = async () => {
    setQuizState('loading');
    try {
      const qs = await generateQuestions();
      if (qs.length === 0) {
        Alert.alert('Error', 'Failed to generate quiz questions');
        setQuizState('idle');
        return;
      }
      setQuestions(qs);
      setSelectedAnswers(new Array(qs.length).fill(null));
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowExplanation(false);
      setStartTime(Date.now());
      setTimeElapsed(0);
      setQuizState('active');
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz questions');
      setQuizState('idle');
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (showExplanation) return; // Don't allow changing after showing explanation
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] === null) {
      Alert.alert('Select an Answer', 'Please select an answer before submitting');
      return;
    }

    const isCorrect = selectedAnswers[currentQuestionIndex] === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      // Quiz complete
      setQuizState('review');
      onComplete(score, questions.length, timeElapsed);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizState('idle');
    setQuestions([]);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizState === 'idle') {
    return (
      <View className="bg-accent-success/10 rounded-xl p-4 border border-accent-success/30">
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 rounded-full bg-accent-success/20 items-center justify-center mr-3">
            <Ionicons name="trophy" size={24} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text className={THEME_CLASSES.heading3}>Interactive Quiz</Text>
            <Text className={`${THEME_CLASSES.caption} mt-0.5`}>
              Test your knowledge with 5 NEET-style questions
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text className={`${THEME_CLASSES.bodySmall} ml-2`}>Instant feedback with explanations</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="time" size={16} color="#10b981" />
            <Text className={`${THEME_CLASSES.bodySmall} ml-2`}>Timed quiz to simulate exam pressure</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="trending-up" size={16} color="#10b981" />
            <Text className={`${THEME_CLASSES.bodySmall} ml-2`}>Updates your mastery level</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleStartQuiz}
          className="bg-accent-success rounded-lg p-3 items-center active:bg-accent-success/80"
        >
          <Text className="text-white font-semibold">Start Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (quizState === 'loading') {
    return (
      <View className="bg-accent-success/10 rounded-xl p-8 border border-accent-success/30 items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className={`${THEME_CLASSES.body} mt-4`}>Generating quiz questions...</Text>
      </View>
    );
  }

  if (quizState === 'review') {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <View className={`rounded-xl p-4 border ${
        passed ? 'bg-accent-success/10 border-accent-success/30' : 'bg-accent-warning/10 border-accent-warning/30'
      }`}>
        <View className="items-center mb-4">
          <View className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${
            passed ? 'bg-accent-success/20' : 'bg-accent-warning/20'
          }`}>
            <Ionicons 
              name={passed ? 'trophy' : 'ribbon'} 
              size={40} 
              color={passed ? '#10b981' : '#f59e0b'} 
            />
          </View>
          <Text className={`${THEME_CLASSES.heading2} mb-2`}>
            {passed ? 'Great Job!' : 'Keep Practicing!'}
          </Text>
          <Text className={THEME_CLASSES.body}>
            You scored {score} out of {questions.length}
          </Text>
        </View>

        <View className="bg-background-secondary rounded-lg p-4 mb-4">
          <View className="flex-row justify-between mb-3">
            <Text className={THEME_CLASSES.body}>Score</Text>
            <Text className={`${THEME_CLASSES.heading3} ${
              passed ? 'text-accent-success' : 'text-accent-warning'
            }`}>
              {percentage}%
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className={THEME_CLASSES.body}>Correct Answers</Text>
            <Text className={THEME_CLASSES.heading3}>{score}/{questions.length}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className={THEME_CLASSES.body}>Time Taken</Text>
            <Text className={THEME_CLASSES.heading3}>{formatTime(timeElapsed)}</Text>
          </View>
        </View>

        <View>
          <TouchableOpacity
            onPress={handleRetakeQuiz}
            className="bg-accent-primary rounded-lg p-3 items-center active:bg-accent-primary/80 mb-2"
          >
            <Text className="text-white font-semibold">Retake Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setQuizState('idle')}
            className="bg-background-secondary rounded-lg p-3 items-center active:bg-background-tertiary"
          >
            <Text className={THEME_CLASSES.body}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active quiz state
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <View className="bg-accent-success/10 rounded-xl p-4 border border-accent-success/30">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-accent-success/20 items-center justify-center mr-3">
            <Text className="text-accent-success font-bold">
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
          <View>
            <Text className={THEME_CLASSES.heading3}>Quiz in Progress</Text>
            <Text className={THEME_CLASSES.caption}>Score: {score}/{currentQuestionIndex}</Text>
          </View>
        </View>
        <View className="bg-background-secondary px-3 py-1.5 rounded-full">
          <Text className={`${THEME_CLASSES.bodySmall} font-semibold`}>
            ⏱️ {formatTime(timeElapsed)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-background-secondary rounded-full mb-4 overflow-hidden">
        <View 
          className="h-full bg-accent-success rounded-full"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </View>

      {/* Question */}
      <View className="bg-background-secondary rounded-lg p-4 mb-4">
        <Text className={`${THEME_CLASSES.body} font-semibold mb-4`}>
          {currentQuestion.question}
        </Text>

        {/* Options */}
        <View>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswer;
            const showCorrect = showExplanation && isCorrectAnswer;
            const showWrong = showExplanation && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelectAnswer(index)}
                disabled={showExplanation}
                className={`flex-row items-center p-3 rounded-lg border mb-3 ${
                  showCorrect ? 'bg-accent-success/20 border-accent-success' :
                  showWrong ? 'bg-accent-error/20 border-accent-error' :
                  isSelected ? 'bg-accent-primary/20 border-accent-primary' :
                  'bg-background-tertiary border-border-secondary'
                }`}
              >
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                  showCorrect ? 'border-accent-success bg-accent-success' :
                  showWrong ? 'border-accent-error bg-accent-error' :
                  isSelected ? 'border-accent-primary bg-accent-primary' :
                  'border-text-tertiary'
                }`}>
                  {(isSelected || showCorrect) && (
                    <Ionicons 
                      name={showCorrect ? 'checkmark' : showWrong ? 'close' : 'checkmark'} 
                      size={16} 
                      color="#fff" 
                    />
                  )}
                </View>
                <Text className={`flex-1 ${THEME_CLASSES.body} ${
                  showCorrect ? 'text-accent-success font-semibold' :
                  showWrong ? 'text-accent-error' :
                  isSelected ? 'text-accent-primary font-medium' :
                  ''
                }`}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Explanation */}
      {showExplanation && (
        <View className={`rounded-lg p-4 mb-4 ${
          isCorrect ? 'bg-accent-success/20' : 'bg-accent-warning/20'
        }`}>
          <View className="flex-row items-center mb-2">
            <Ionicons 
              name={isCorrect ? 'checkmark-circle' : 'information-circle'} 
              size={20} 
              color={isCorrect ? '#10b981' : '#f59e0b'} 
            />
            <Text className={`ml-2 font-semibold ${
              isCorrect ? 'text-accent-success' : 'text-accent-warning'
            }`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>
          <Text className={THEME_CLASSES.bodySmall}>
            {currentQuestion.explanation}
          </Text>
        </View>
      )}

      {/* Action Button */}
      {!showExplanation ? (
        <TouchableOpacity
          onPress={handleSubmitAnswer}
          disabled={selectedAnswer === null}
          className={`rounded-lg p-3 items-center ${
            selectedAnswer === null 
              ? 'bg-text-disabled' 
              : 'bg-accent-success active:bg-accent-success/80'
          }`}
        >
          <Text className="text-white font-semibold">Submit Answer</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleNextQuestion}
          className="bg-accent-primary rounded-lg p-3 items-center active:bg-accent-primary/80"
        >
          <Text className="text-white font-semibold">
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
