import { THEME_CLASSES } from '@/src/config/theme.config';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StudyNotesService } from '../../services/study-notes.service';
import { StudyPathAIService } from '../../services/study-path-ai.service';

interface Note {
  note_id: string;
  content: string;
  is_highlighted: boolean;
  created_at: string;
}

interface StudyNotesProps {
  topicId: string;
  topicName: string;
  userId: string;
}

export function StudyNotes({ topicId, topicName, userId }: StudyNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [topicId, userId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const fetchedNotes = await StudyNotesService.getNotesByTopic(userId, topicId);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      await StudyNotesService.createNote(userId, topicId, newNote.trim(), false);
      setNewNote('');
      await loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHighlight = async (noteId: string, currentState: boolean) => {
    try {
      await StudyNotesService.updateNote(noteId, { is_highlighted: !currentState });
      await loadNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StudyNotesService.deleteNote(noteId);
              await loadNotes();
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          }
        }
      ]
    );
  };

  const loadAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const suggestions = await StudyPathAIService.generateKeyPoints(topicName);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      Alert.alert('Error', 'Failed to generate suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddSuggestion = async (suggestion: string) => {
    setSaving(true);
    try {
      await StudyNotesService.createNote(userId, topicId, suggestion, true);
      await loadNotes();
      setAiSuggestions(prev => prev.filter(s => s !== suggestion));
    } catch (error) {
      console.error('Error saving suggestion:', error);
    } finally {
      setSaving(false);
    }
  };

  const highlightedNotes = notes.filter(n => n.is_highlighted);
  const regularNotes = notes.filter(n => !n.is_highlighted);

  return (
    <ScrollView className="flex-1">
      {/* Add Note Section */}
      <View className={`${THEME_CLASSES.card} mb-4`}>
        <Text className={`${THEME_CLASSES.heading3} mb-3`}>Add Note</Text>
        <TextInput
          value={newNote}
          onChangeText={setNewNote}
          placeholder="Write your notes here..."
          placeholderTextColor="#717171"
          multiline
          numberOfLines={4}
          className="bg-background-secondary border border-border-secondary rounded-lg p-3 text-text-primary mb-3"
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
        <TouchableOpacity
          onPress={handleAddNote}
          disabled={!newNote.trim() || saving}
          className={`${THEME_CLASSES.buttonPrimary} ${(!newNote.trim() || saving) ? 'opacity-50' : ''}`}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold">Save Note</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* AI Suggestions */}
      <View className="bg-accent-secondary/10 rounded-xl p-4 mb-4 border border-accent-secondary/30">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="sparkles" size={20} color="#8b5cf6" />
            <Text className={`${THEME_CLASSES.heading3} ml-2`}>AI Key Points</Text>
          </View>
          {!loadingSuggestions && aiSuggestions.length === 0 && (
            <TouchableOpacity onPress={loadAISuggestions}>
              <Text className="text-accent-secondary text-xs font-semibold">Generate</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingSuggestions ? (
          <View className="py-4 items-center">
            <ActivityIndicator color="#8b5cf6" />
            <Text className={`${THEME_CLASSES.bodySmall} mt-2`}>Generating key points...</Text>
          </View>
        ) : aiSuggestions.length > 0 ? (
          <View className="space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <View key={index} className="bg-background-secondary rounded-lg p-3 flex-row items-start">
                <Text className="flex-1 text-text-primary text-sm">{suggestion}</Text>
                <TouchableOpacity
                  onPress={() => handleAddSuggestion(suggestion)}
                  className="ml-2"
                  disabled={saving}
                >
                  <Ionicons name="add-circle" size={24} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text className={THEME_CLASSES.bodySmall}>
            AI can suggest important points to note for this topic
          </Text>
        )}
      </View>

      {/* Highlighted Notes */}
      {highlightedNotes.length > 0 && (
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="star" size={20} color="#f59e0b" />
            <Text className={`${THEME_CLASSES.heading3} ml-2`}>Highlights ({highlightedNotes.length})</Text>
          </View>
          {highlightedNotes.map(note => (
            <View key={note.note_id} className="bg-accent-warning/10 border border-accent-warning/30 rounded-lg p-3 mb-2">
              <Text className="text-text-primary text-sm mb-2">{note.content}</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-text-tertiary text-xs">
                  {new Date(note.created_at).toLocaleDateString()}
                </Text>
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity onPress={() => handleToggleHighlight(note.note_id, note.is_highlighted)}>
                    <Ionicons name="star" size={20} color="#f59e0b" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteNote(note.note_id)} className="ml-3">
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Regular Notes */}
      {loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator color="#8b5cf6" />
        </View>
      ) : regularNotes.length > 0 ? (
        <View>
          <Text className={`${THEME_CLASSES.heading3} mb-3`}>My Notes ({regularNotes.length})</Text>
          {regularNotes.map(note => (
            <View key={note.note_id} className={`${THEME_CLASSES.card} mb-2`}>
              <Text className="text-text-primary text-sm mb-2">{note.content}</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-text-tertiary text-xs">
                  {new Date(note.created_at).toLocaleDateString()}
                </Text>
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity onPress={() => handleToggleHighlight(note.note_id, note.is_highlighted)}>
                    <Ionicons name="star-outline" size={20} color="#717171" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteNote(note.note_id)} className="ml-3">
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="py-8 items-center">
          <Ionicons name="document-text-outline" size={48} color="#717171" />
          <Text className={`${THEME_CLASSES.bodySmall} mt-2`}>No notes yet. Start taking notes!</Text>
        </View>
      )}
    </ScrollView>
  );
}
