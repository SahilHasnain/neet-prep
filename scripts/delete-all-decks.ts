/**
 * Delete All Flashcard Decks Script
 * WARNING: This will delete all decks and their flashcards
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Query } from 'node-appwrite';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '';
const DECKS_COLLECTION_ID = '6794e0e5001e8e0e0e8e';
const CARDS_COLLECTION_ID = '6794e0f2000e8e0e0e8f';

async function deleteAllDecks() {
  console.log('=== Delete All Flashcard Decks ===\n');
  console.log('⚠️  WARNING: This will delete ALL decks and flashcards!');
  console.log('This action cannot be undone.\n');

  try {
    // Get all decks
    let allDecks: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    console.log('Fetching all decks...');
    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        DECKS_COLLECTION_ID,
        [Query.limit(limit), Query.offset(offset)]
      );

      allDecks = allDecks.concat(response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;
    }

    console.log(`Found ${allDecks.length} decks to delete\n`);

    if (allDecks.length === 0) {
      console.log('No decks found. Nothing to delete.');
      return;
    }

    // Delete each deck and its cards
    let deletedDecks = 0;
    let deletedCards = 0;

    for (const deck of allDecks) {
      console.log(`Deleting deck: ${deck.title} (${deck.deck_id})`);

      // Get all cards for this deck
      const cards = await databases.listDocuments(
        DATABASE_ID,
        CARDS_COLLECTION_ID,
        [Query.equal('deck_id', deck.deck_id), Query.limit(1000)]
      );

      // Delete all cards
      for (const card of cards.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          CARDS_COLLECTION_ID,
          card.$id
        );
        deletedCards++;
      }

      // Delete the deck
      await databases.deleteDocument(
        DATABASE_ID,
        DECKS_COLLECTION_ID,
        deck.$id
      );
      deletedDecks++;

      console.log(`  ✓ Deleted ${cards.documents.length} cards`);
    }

    console.log('\n=== Deletion Summary ===');
    console.log(`Decks deleted: ${deletedDecks}`);
    console.log(`Cards deleted: ${deletedCards}`);
    console.log('\n✓ All decks and flashcards deleted successfully!');
  } catch (error) {
    console.error('\n✗ Deletion failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await deleteAllDecks();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { deleteAllDecks };
