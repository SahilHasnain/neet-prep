import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DIAGNOSTIC_QUESTIONS } from '../../src/config/diagnostic-quiz.config';
import { DiagnosticQuestion, DiagnosticQuestionsService } from '../../src/services/diagnostic-questions.service';

export default function DiagnosticQuizScreen() {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: number; isCorrect: boolean; timeTaken: number }[]>([]);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const cachedQuestions = await DiagnosticQuestionsService.getQuestions();
      
      if (cachedQuestions.length > 0) {
        setQuestions(cachedQuestions);
      } else {
        // Fallback to hardcoded questions if everything fails
        setQuestions(DIAGNOSTIC_QUESTIONS as any);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      // Fallback to hardcoded questions
      setQuestions(DIAGNOSTIC_QUESTIONS as any);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600 text-center px-6">
          Generating personalized diagnostic questions...
        </Text>
        <Text className="mt-2 text-sm text-gray-500 text-center px-6">
          This may take a moment
        </Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
        <Text className="text-gray-600 text-center mb-4">
          Failed to load diagnostic questions
        </Text>
        <TouchableOpacity
          onPress={loadQuestions}
          className="bg-blue-600 rounded-xl px-6 py-3"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (optionIndex: number) => {
    const isCorrect = optionIndex === question.correctAnswer;
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    const newAnswers = [
      ...answers,
      {
        questionId: question.id,
        selectedAnswer: optionIndex,
        isCorrect,
        timeTaken
      }
    ];

    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Quiz completed
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = (finalAnswers: typeof answers) => {
    const totalCorrect = finalAnswers.filter(a => a.isCorrect).length;
    const totalScore = Math.round((totalCorrect / questions.length) * 100);

    // Calculate subject-wise scores
    const physicsQuestions = questions.filter(q => q.subject === 'Physics');
    const chemistryQuestions = questions.filter(q => q.subject === 'Chemistry');
    const biologyQuestions = questions.filter(q => q.subject === 'Biology');

    const physicsScore = Math.round(
      (finalAnswers.filter(a => physicsQuestions.some(q => q.id === a.questionId) && a.isCorrect).length / physicsQuestions.length) * 100
    );
    const chemistryScore = Math.round(
      (finalAnswers.filter(a => chemistryQuestions.some(q => q.id === a.questionId) && a.isCorrect).length / chemistryQuestions.length) * 100
    );
    const biologyScore = Math.round(
      (finalAnswers.filter(a => biologyQuestions.some(q => q.id === a.questionId) && a.isCorrect).length / biologyQuestions.length) * 100
    );

    // Identify weak and strong topics
    const topicScores = new Map<string, { correct: number; total: number }>();
    
    questions.forEach(q => {
      const answer = finalAnswers.find(a => a.questionId === q.id);
      if (!topicScores.has(q.topicId)) {
        topicScores.set(q.topicId, { correct: 0, total: 0 });
      }
      const score = topicScores.get(q.topicId)!;
      score.total++;
      if (answer?.isCorrect) score.correct++;
    });

    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    topicScores.forEach((score, topicId) => {
      const percentage = (score.correct / score.total) * 100;
      if (percentage < 50) {
        weakTopics.push(topicId);
      } else if (percentage >= 80) {
        strongTopics.push(topicId);
      }
    });

    // Navigate to results with data
    router.push({
      pathname: '/diagnostic/results',
      params: {
        totalScore: totalScore.toString(),
        physicsScore: physicsScore.toString(),
        chemistryScore: chemistryScore.toString(),
        biologyScore: biologyScore.toString(),
        weakTopics: JSON.stringify(weakTopics),
        strongTopics: JSON.stringify(strongTopics),
        detailedResults: JSON.stringify(finalAnswers)
      }
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Progress Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-medium text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <Text className="text-sm font-medium text-blue-600">
            {Math.round(progress)}%
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View 
            className="h-full bg-blue-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Subject Badge */}
        <View className="mb-4">
          <View className={`self-start px-3 py-1 rounded-full ${
            question.subject === 'Physics' ? 'bg-blue-100' :
            question.subject === 'Chemistry' ? 'bg-green-100' :
            'bg-purple-100'
          }`}>
            <Text className={`text-xs font-semibold ${
              question.subject === 'Physics' ? 'text-blue-700' :
              question.subject === 'Chemistry' ? 'text-green-700' :
              'text-purple-700'
            }`}>
              {question.subject}
            </Text>
          </View>
        </View>

        {/* Question */}
        <Text className="text-xl font-semibold text-gray-900 mb-6">
          {question.question}
        </Text>

        {/* Options */}
        <View className="space-y-3">
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(index)}
              className="bg-white p-4 rounded-xl border-2 border-gray-200 active:border-blue-500"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <Text className="text-sm font-semibold text-gray-700">
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text className="flex-1 text-base text-gray-800">
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Difficulty Indicator */}
        <View className="mt-6 flex-row items-center">
          <Text className="text-sm text-gray-500 mr-2">Difficulty:</Text>
          <View className={`px-2 py-1 rounded ${
            question.difficulty === 'easy' ? 'bg-green-100' :
            question.difficulty === 'medium' ? 'bg-yellow-100' :
            'bg-red-100'
          }`}>
            <Text className={`text-xs font-medium ${
              question.difficulty === 'easy' ? 'text-green-700' :
              question.difficulty === 'medium' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {question.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
