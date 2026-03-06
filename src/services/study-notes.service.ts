import { ID, Query } from 'react-native-appwrite';
import { databases } from './appwrite';

const DATABASE_ID = 'flashcard_db';
const NOTES_COLLECTION_ID = 'study_notes';

export interface StudyNote {
  note_id: string;
  user_id: string;
  topic_id: string;
  content: string;
  is_highlighted: boolean;
  created_at: string;
  updated_at: string;
}

export class StudyNotesService {
  static async createNote(
    userId: string,
    topicId: string,
    content: string,
    isHighlighted: boolean = false
  ): Promise<StudyNote> {
    const noteId = ID.unique();
    const now = new Date().toISOString();

    const note = await databases.createDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      noteId,
      {
        note_id: noteId,
        user_id: userId,
        topic_id: topicId,
        content,
        is_highlighted: isHighlighted,
        created_at: now,
        updated_at: now,
      }
    );

    return note as unknown as StudyNote;
  }

  static async getNotesByTopic(userId: string, topicId: string): Promise<StudyNote[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.equal('topic_id', topicId),
        Query.orderDesc('created_at'),
        Query.limit(100),
      ]
    );

    return response.documents as unknown as StudyNote[];
  }

  static async updateNote(noteId: string, updates: Partial<StudyNote>): Promise<StudyNote> {
    const note = await databases.updateDocument(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      noteId,
      {
        ...updates,
        updated_at: new Date().toISOString(),
      }
    );

    return note as unknown as StudyNote;
  }

  static async deleteNote(noteId: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
  }

  static async getHighlightedNotes(userId: string): Promise<StudyNote[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      NOTES_COLLECTION_ID,
      [
        Query.equal('user_id', userId),
        Query.equal('is_highlighted', true),
        Query.orderDesc('created_at'),
        Query.limit(50),
      ]
    );

    return response.documents as unknown as StudyNote[];
  }
}
