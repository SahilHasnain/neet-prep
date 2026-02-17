/**
 * useAIQuiz Hook
 * Manages AI-generated quiz sessions
 */

import { useState } from "react";
import { AIDiagramService } from "../services/ai-diagram.service";
import type {
  DiagramLabel,
  DifficultyLevel,
  QuizAnswer,
  QuizQuestion,
  QuizQuestionType,
  QuizSession,
} from "../types/flashcard.types";

export function useAIQuiz(userId: string, cardId: string) {
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(
    null,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate quiz questions from labels
   */
  const generateQuestions = async (
    labels: DiagramLabel[],
    questionCount: number = 5,
    questionTypes: QuizQuestionType[] = [
      QuizQuestionType.IDENTIFICATION,
      QuizQuestionType.FUNCTION,
      QuizQuestionType.MULTIPLE_CHOICE,
    ],
    difficulty: DifficultyLevel = "medium" as DifficultyLevel,
  ) => {
    try {
      setGenerating(true);
      setError(null);

      const response = await AIDiagramService.generateQuizQuestions(
        userId,
        cardId,
        labels,
        questionCount,
        questionTypes,
        difficulty,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to generate questions");
      }

      const generatedQuestions = response.data?.questions || [];
      setQuestions(generatedQuestions);

      return generatedQuestions;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate questions";
      setError(errorMessage);
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Start a new quiz session
   */
  const startSession = (quizQuestions?: QuizQuestion[]) => {
    const questionsToUse = quizQuestions || questions;

    if (questionsToUse.length === 0) {
      setError("No questions available to start quiz");
      return null;
    }

    const session: QuizSession = {
      session_id: `session_${Date.now()}`,
      card_id: cardId,
      questions: questionsToUse,
      answers: [],
      score: 0,
      started_at: new Date().toISOString(),
    };

    setCurrentSession(session);
    setCurrentQuestionIndex(0);
    setError(null);

    return session;
  };

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = (answer: string) => {
    if (!currentSession) {
      setError("No active session");
      return false;
    }

    const currentQuestion = currentSession.questions[currentQuestionIndex];
    if (!currentQuestion) {
      setError("Invalid question index");
      return false;
    }

    // Check if answer is correct (case-insensitive)
    const isCorrect =
      answer.trim().toLowerCase() ===
      currentQuestion.correct_answer.trim().toLowerCase();

    const quizAnswer: QuizAnswer = {
      question_id: currentQuestion.question_id,
      user_answer: answer,
      is_correct: isCorrect,
      time_taken: 0, // Can be enhanced with timer
    };

    // Update session
    const updatedSession = {
      ...currentSession,
      answers: [...currentSession.answers, quizAnswer],
      score: isCorrect ? currentSession.score + 1 : currentSession.score,
    };

    setCurrentSession(updatedSession);

    return isCorrect;
  };

  /**
   * Move to next question
   */
  const nextQuestion = () => {
    if (!currentSession) return false;

    if (currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return true;
    }

    return false;
  };

  /**
   * Move to previous question
   */
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      return true;
    }

    return false;
  };

  /**
   * End the current session
   */
  const endSession = () => {
    if (!currentSession) return null;

    const completedSession = {
      ...currentSession,
      completed_at: new Date().toISOString(),
    };

    setCurrentSession(completedSession);
    return completedSession;
  };

  /**
   * Reset quiz state
   */
  const resetQuiz = () => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  /**
   * Get current question
   */
  const getCurrentQuestion = (): QuizQuestion | null => {
    if (!currentSession) return null;
    return currentSession.questions[currentQuestionIndex] || null;
  };

  /**
   * Get quiz progress
   */
  const getProgress = () => {
    if (!currentSession) {
      return { current: 0, total: 0, percentage: 0 };
    }

    return {
      current: currentQuestionIndex + 1,
      total: currentSession.questions.length,
      percentage:
        ((currentQuestionIndex + 1) / currentSession.questions.length) * 100,
    };
  };

  /**
   * Check if quiz is complete
   */
  const isComplete = () => {
    if (!currentSession) return false;
    return (
      currentSession.answers.length === currentSession.questions.length &&
      currentQuestionIndex === currentSession.questions.length - 1
    );
  };

  return {
    generating,
    questions,
    currentSession,
    currentQuestionIndex,
    error,
    generateQuestions,
    startSession,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    endSession,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    isComplete,
  };
}
