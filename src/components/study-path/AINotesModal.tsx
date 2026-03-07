/**
 * AI-Generated Notes Modal
 * Displays AI-generated study notes with progressive unlocking
 * Users select language and format BEFORE generation to save API costs
 */

import { THEME_CLASSES } from '@/src/config/theme.config';
import { AINotesService, GeneratedNotes, Language, NoteFormat } from '@/src/services/ai-notes.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Markdown from 'react-native-markdown-display';

interface AINotesModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  topicId: string;
  topicName: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: {
    videoProgress: number;
    quizAttempts: number;
    masteryLevel: number;
  };
  weakAreas?: string[];
  quizPerformance?: {
    score: number;
    missedConcepts: string[];
  };
}

type ViewState = 'selection' | 'loading' | 'viewing';

export function AINotesModal({
  visible,
  onClose,
  userId,
  topicId,
  topicName,
  subject,
  difficulty,
  progress,
  weakAreas,
  quizPerformance
}: AINotesModalProps) {
  const [viewState, setViewState] = useState<ViewState>('selection');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [selectedFormat, setSelectedFormat] = useState<NoteFormat>('comprehensive');
  const [notes, setNotes] = useState<GeneratedNotes | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    setViewState('loading');
    
    try {
      // First, check if notes already exist in database
      const existingNotes = await AINotesService.getExistingNotes(
        userId,
        topicId,
        selectedLanguage,
        selectedFormat
      );

      if (existingNotes) {
        console.log('✅ Loaded notes from database (saved API call)');
        const notesWithUnlocks = AINotesService.calculateUnlockedSections(existingNotes, progress);
        setNotes(notesWithUnlocks);
        
        // Auto-expand first unlocked section
        const firstUnlocked = notesWithUnlocks.sections.find(s => s.isUnlocked);
        if (firstUnlocked) {
          setExpandedSections(new Set([firstUnlocked.id]));
        }
        
        setViewState('viewing');
        return;
      }

      // Generate new notes
      console.log('🤖 Generating new notes with AI...');
      const generatedNotes = await AINotesService.generateNotes({
        topicName,
        subject,
        difficulty,
        language: selectedLanguage,
        format: selectedFormat,
        weakAreas,
        quizPerformance
      });

      // Save to database for future use
      await AINotesService.saveNotes(userId, topicId, generatedNotes);

      // Calculate unlocked sections
      const notesWithUnlocks = AINotesService.calculateUnlockedSections(generatedNotes, progress);
      setNotes(notesWithUnlocks);
      
      // Auto-expand first unlocked section
      const firstUnlocked = notesWithUnlocks.sections.find(s => s.isUnlocked);
      if (firstUnlocked) {
        setExpandedSections(new Set([firstUnlocked.id]));
      }
      
      setViewState('viewing');
    } catch (error) {
      console.error('Error generating notes:', error);
      Alert.alert(
        'Generation Failed',
        'Failed to generate notes. Please check your internet connection and try again.',
        [{ text: 'OK', onPress: () => setViewState('selection') }]
      );
    }
  };

  const handleChangeSettings = () => {
    Alert.alert(
      'Change Settings?',
      'This will generate new notes with different language or format. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Change',
          onPress: () => {
            setNotes(null);
            setViewState('selection');
          }
        }
      ]
    );
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleShare = async () => {
    if (!notes) return;

    const content = notes.sections
      .filter(s => s.isUnlocked)
      .map(s => `## ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');

    try {
      await Share.share({
        message: `${topicName} - Study Notes\n\n${content}`,
        title: `${topicName} Notes`
      });
    } catch (error) {
      console.error('Error sharing notes:', error);
    }
  };

  const handleClose = () => {
    setViewState('selection');
    setNotes(null);
    setExpandedSections(new Set());
    onClose();
  };

  const getFormatIcon = (format: NoteFormat) => {
    switch (format) {
      case 'comprehensive': return 'book';
      case 'formula-sheet': return 'calculator';
      case 'quick-revision': return 'flash';
      case 'common-mistakes': return 'warning';
      default: return 'document-text';
    }
  };

  const getFormatDescription = (format: NoteFormat) => {
    switch (format) {
      case 'comprehensive': return 'Full detailed notes with all concepts';
      case 'formula-sheet': return 'Organized formulas with examples';
      case 'quick-revision': return '5-minute condensed version';
      case 'common-mistakes': return 'Pitfalls to avoid';
      default: return '';
    }
  };

  const getUnlockMessage = (condition: any) => {
    switch (condition.type) {
      case 'video':
        return `Watch ${condition.threshold}% of videos to unlock`;
      case 'quiz':
        return 'Complete a quiz to unlock';
      case 'always':
        return 'Unlocked';
      default:
        return `Reach ${condition.threshold}% mastery to unlock`;
    }
  };

  const unlockedCount = notes?.sections.filter(s => s.isUnlocked).length || 0;
  const totalCount = notes?.sections.length || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-background-primary">
        {/* Header */}
        <View className="bg-accent-primary px-4 pt-12 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold flex-1 text-center">
              AI Study Notes
            </Text>
            {viewState === 'viewing' && notes && (
              <TouchableOpacity onPress={handleShare} className="p-2">
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {viewState === 'viewing' && !notes && <View className="w-10" />}
          </View>
          
          <Text className="text-white/90 text-center text-sm mb-2">{topicName}</Text>
          
          {viewState === 'viewing' && notes && (
            <View className="flex-row items-center justify-center gap-4">
              <View className="flex-row items-center">
                <Ionicons name="lock-open" size={16} color="#fff" />
                <Text className="text-white/80 text-xs ml-1">
                  {unlockedCount}/{totalCount} sections
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time" size={16} color="#fff" />
                <Text className="text-white/80 text-xs ml-1">
                  {notes.metadata.estimatedReadTime} min read
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Selection View */}
        {viewState === 'selection' && (
          <ScrollView className="flex-1 px-4 py-6">
            <View className="items-center mb-6">
              <View className="bg-accent-primary/10 rounded-full p-6 mb-4">
                <Ionicons name="sparkles" size={48} color="#8b5cf6" />
              </View>
              <Text className={`${THEME_CLASSES.heading2} mb-2 text-center`}>
                Generate AI Notes
              </Text>
              <Text className={`${THEME_CLASSES.body} text-center px-4`}>
                Select your preferences before generating notes
              </Text>
            </View>

            {/* Language Selection */}
            <View className="mb-6">
              <Text className={`${THEME_CLASSES.heading3} mb-3`}>
                Choose Language
              </Text>
              <View>
                <TouchableOpacity
                  onPress={() => setSelectedLanguage('english')}
                  className={`p-4 rounded-xl border-2 mb-3 ${
                    selectedLanguage === 'english'
                      ? 'bg-accent-primary/10 border-accent-primary'
                      : 'bg-background-secondary border-border-secondary'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons 
                        name="language" 
                        size={24} 
                        color={selectedLanguage === 'english' ? '#8b5cf6' : '#717171'} 
                      />
                      <View className="ml-3 flex-1">
                        <Text className={`font-bold ${
                          selectedLanguage === 'english' ? 'text-accent-primary' : 'text-text-primary'
                        }`}>
                          English
                        </Text>
                        <Text className="text-text-tertiary text-xs mt-1">
                          Clear, technical language for NEET
                        </Text>
                      </View>
                    </View>
                    {selectedLanguage === 'english' && (
                      <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedLanguage('hinglish')}
                  className={`p-4 rounded-xl border-2 ${
                    selectedLanguage === 'hinglish'
                      ? 'bg-accent-primary/10 border-accent-primary'
                      : 'bg-background-secondary border-border-secondary'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons 
                        name="language" 
                        size={24} 
                        color={selectedLanguage === 'hinglish' ? '#8b5cf6' : '#717171'} 
                      />
                      <View className="ml-3 flex-1">
                        <Text className={`font-bold ${
                          selectedLanguage === 'hinglish' ? 'text-accent-primary' : 'text-text-primary'
                        }`}>
                          Hinglish
                        </Text>
                        <Text className="text-text-tertiary text-xs mt-1">
                          Hindi-English mix for better understanding
                        </Text>
                      </View>
                    </View>
                    {selectedLanguage === 'hinglish' && (
                      <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Format Selection */}
            <View className="mb-6">
              <Text className={`${THEME_CLASSES.heading3} mb-3`}>
                Choose Format
              </Text>
              <View>
                {(['comprehensive', 'formula-sheet', 'quick-revision', 'common-mistakes'] as NoteFormat[]).map(format => (
                  <TouchableOpacity
                    key={format}
                    onPress={() => setSelectedFormat(format)}
                    className={`p-4 rounded-xl border-2 mb-3 ${
                      selectedFormat === format
                        ? 'bg-accent-primary/10 border-accent-primary'
                        : 'bg-background-secondary border-border-secondary'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Ionicons 
                          name={getFormatIcon(format) as any} 
                          size={24} 
                          color={selectedFormat === format ? '#8b5cf6' : '#717171'} 
                        />
                        <View className="ml-3 flex-1">
                          <Text className={`font-bold ${
                            selectedFormat === format ? 'text-accent-primary' : 'text-text-primary'
                          }`}>
                            {format.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Text>
                          <Text className="text-text-tertiary text-xs mt-1">
                            {getFormatDescription(format)}
                          </Text>
                        </View>
                      </View>
                      {selectedFormat === format && (
                        <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              onPress={handleGenerate}
              className={`${THEME_CLASSES.buttonPrimary} mt-4`}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text className="text-white font-bold ml-2">Generate Notes</Text>
            </TouchableOpacity>

            <Text className="text-text-tertiary text-xs text-center mt-4">
              Notes will be saved for future access
            </Text>
          </ScrollView>
        )}

        {/* Loading View */}
        {viewState === 'loading' && (
          <View className="flex-1 items-center justify-center px-6">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className="text-text-primary text-lg font-semibold mt-6">
              Generating Your Notes...
            </Text>
            <Text className="text-text-secondary text-center mt-2">
              Creating personalized {selectedFormat.split('-').join(' ')} notes in {selectedLanguage}
            </Text>
            <Text className="text-text-tertiary text-xs text-center mt-4">
              This may take 5-15 seconds
            </Text>
          </View>
        )}

        {/* Viewing Notes */}
        {viewState === 'viewing' && notes && (
          <>
            {/* Settings Bar */}
            <View className="bg-background-secondary px-4 py-3 border-b border-border-subtle flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="language" size={16} color="#8b5cf6" />
                <Text className="text-text-secondary text-sm ml-1">
                  {selectedLanguage === 'english' ? 'English' : 'Hinglish'}
                </Text>
                <Text className="text-text-tertiary text-sm mx-2">•</Text>
                <Ionicons name={getFormatIcon(selectedFormat) as any} size={16} color="#8b5cf6" />
                <Text className="text-text-secondary text-sm ml-1">
                  {selectedFormat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </View>
              <TouchableOpacity onPress={handleChangeSettings}>
                <Text className="text-accent-primary text-sm font-semibold">Change</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
              {/* Key Takeaways */}
              {notes.metadata.keyTakeaways.length > 0 && (
                <View className="bg-accent-secondary/10 rounded-xl p-4 mb-4 border border-accent-secondary/30">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="bulb" size={20} color="#8b5cf6" />
                    <Text className="text-text-primary font-bold ml-2">Key Takeaways</Text>
                  </View>
                  {notes.metadata.keyTakeaways.map((takeaway, idx) => (
                    <View key={idx} className="flex-row items-start mt-2">
                      <Text className="text-accent-secondary mr-2">•</Text>
                      <Text className="text-text-secondary text-sm flex-1">{takeaway}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Sections */}
              {notes.sections.map((section) => (
                <View key={section.id} className="mb-3">
                  <TouchableOpacity
                    onPress={() => section.isUnlocked && toggleSection(section.id)}
                    className={`rounded-xl p-4 border ${
                      section.isUnlocked
                        ? 'bg-background-secondary border-border-secondary'
                        : 'bg-background-tertiary border-border-subtle'
                    }`}
                    disabled={!section.isUnlocked}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        {section.isUnlocked ? (
                          <Ionicons
                            name={expandedSections.has(section.id) ? 'chevron-down' : 'chevron-forward'}
                            size={20}
                            color="#8b5cf6"
                          />
                        ) : (
                          <Ionicons name="lock-closed" size={20} color="#717171" />
                        )}
                        <Text className={`font-bold ml-2 flex-1 ${
                          section.isUnlocked ? 'text-text-primary' : 'text-text-tertiary'
                        }`}>
                          {section.title}
                        </Text>
                      </View>
                      {!section.isUnlocked && (
                        <View className="bg-accent-warning/20 px-2 py-1 rounded">
                          <Text className="text-accent-warning text-xs font-semibold">Locked</Text>
                        </View>
                      )}
                    </View>

                    {!section.isUnlocked && (
                      <Text className="text-text-tertiary text-xs mt-2 ml-7">
                        {getUnlockMessage(section.unlockCondition)}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Section Content */}
                  {section.isUnlocked && expandedSections.has(section.id) && (
                    <View className="bg-background-primary rounded-xl p-4 mt-2 border border-border-subtle">
                      <Markdown
                        style={{
                          body: { color: '#e5e5e5', fontSize: 14, lineHeight: 22 },
                          heading1: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
                          heading2: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
                          heading3: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
                          bullet_list: { marginBottom: 8 },
                          ordered_list: { marginBottom: 8 },
                          list_item: { marginBottom: 4 },
                          code_inline: { backgroundColor: '#2a2a2a', color: '#8b5cf6', padding: 2, borderRadius: 4 },
                          code_block: { backgroundColor: '#2a2a2a', padding: 12, borderRadius: 8, marginBottom: 8 },
                          strong: { color: '#fff', fontWeight: 'bold' },
                          em: { color: '#a3a3a3', fontStyle: 'italic' }
                        }}
                      >
                        {section.content}
                      </Markdown>
                    </View>
                  )}
                </View>
              ))}

              {/* Progress Indicator */}
              <View className="bg-background-secondary rounded-xl p-4 mt-4 mb-8">
                <Text className="text-text-secondary text-sm font-semibold mb-3">Your Progress</Text>
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-text-tertiary text-xs">Video Progress</Text>
                    <Text className="text-accent-primary text-xs font-bold">{progress.videoProgress}%</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-text-tertiary text-xs">Quiz Attempts</Text>
                    <Text className="text-accent-primary text-xs font-bold">{progress.quizAttempts}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-text-tertiary text-xs">Mastery Level</Text>
                    <Text className="text-accent-primary text-xs font-bold">{progress.masteryLevel}%</Text>
                  </View>
                </View>
                <Text className="text-text-tertiary text-xs mt-3 text-center">
                  Keep learning to unlock more sections!
                </Text>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}
