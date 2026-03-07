/**
 * Custom hook for Guided Study Session logic
 */

import { useState } from 'react';
import { Alert } from 'react-native';

export type SessionPhase = 'intro' | 'video' | 'active-recall' | 'quiz' | 'review' | 'complete';
export type ConfidenceLevel = 'not-sure' | 'somewhat' | 'very-confident';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  confidence: ConfidenceLevel | null;
}

export function useGuidedSession(
  generateQuestions: () => Promise<QuizQuestion[]>,
  onSessionComplete: (masteryGained: number, timeSpent: number) => void
) {
  const [phase, setPhase] = useState<SessionPhase>('intro');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const handleStartSession = () => {
    setSessionStartTime(Date.now());
    setPhase('video');
    setTimeRemaining(25 * 60);
  };

  const handleVideoComplete = () => {
    setPhase('active-recall');
  };

  const handleActiveRecallComplete = async () => {
    setPhase('quiz');
    setLoadingQuiz(true);
    try {
      const qs = await generateQuestions();
      setQuestions(qs.slice(0, 3));
      setCurrentQuestionIndex(0);
      setAnswers([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz. Continuing session...');
      setPhase('review');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setSelectedConfidence(null);
  };

  const handleSelectConfidence = (confidence: ConfidenceLevel) => {
    setSelectedConfidence(confidence);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert('Select an Answer', 'Please select an answer before submitting');
      return;
    }
    
    if (selectedConfidence === null) {
      Alert.alert('Rate Your Confidence', 'Please indicate how confident you are in your answer');
      return;
    }
    
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    
    setAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      selectedAnswer: selectedAnswer,
      isCorrect,
      confidence: selectedConfidence
    }]);
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSelectedConfidence(null);
      setShowExplanation(false);
    } else {
      setPhase('review');
    }
  };

  const handleCompleteSession = () => {
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const quizScore = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    const masteryGained = Math.round(quizScore / 3);
    
    onSessionComplete(masteryGained, timeSpent);
    setPhase('complete');
  };

  const resetSession = () => {
    setPhase('intro');
    setTimeRemaining(25 * 60);
    setIsPaused(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedConfidence(null);
    setShowExplanation(false);
    setAnswers([]);
  };

  return {
    phase,
    setPhase,
    timeRemaining,
    setTimeRemaining,
    sessionStartTime,
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
  };
}
