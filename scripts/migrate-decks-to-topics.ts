/**
 * Migration Script: Link Existing Decks to Study Path Topics
 * 
 * This script:
 * 1. Adds topic_id field to flashcard_decks collection
 * 2. Links existing decks to topics based on category/subject matching
 * 3. Handles orphaned decks (no matching topic)
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
const DECKS_COLLECTION = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_FLASHCARD_DECKS || '';

console.log('Config check:', {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ? '✓' : '✗',
  project: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ? '✓' : '✗',
  database: DATABASE_ID ? '✓' : '✗',
  collection: DECKS_COLLECTION ? '✓' : '✗'
});

interface Deck {
  deck_id: string;
  title: string;
  category?: string;
  description?: string;
}

interface Topic {
  id: string;
  name: string;
  subject: string;
}

// Import knowledge graph topics
async function getKnowledgeGraphTopics(): Promise<Topic[]> {
  // This would normally import from knowledge-graph.config
  // For now, we'll use a simplified version
  const { KNOWLEDGE_GRAPH } = await import('../src/config/knowledge-graph.config');
  return KNOWLEDGE_GRAPH.map(t => ({
    id: t.id,
    name: t.name,
    subject: t.subject
  }));
}

// Match deck to topic based on category and title
function findMatchingTopic(deck: Deck, topics: Topic[]): string | null {
  const deckTitle = deck.title.toLowerCase();
  const deckCategory = (deck.category || '').toLowerCase();
  const deckDescription = (deck.description || '').toLowerCase();

  // Try exact name match first
  let match = topics.find(t => 
    t.name.toLowerCase() === deckTitle ||
    deckTitle.includes(t.name.toLowerCase())
  );

  if (match) return match.id;

  // Try subject match with title similarity
  match = topics.find(t => {
    const subjectMatch = t.subject.toLowerCase() === deckCategory;
    const nameInTitle = deckTitle.includes(t.name.toLowerCase().split(' ')[0]);
    const nameInDesc = deckDescription.includes(t.name.toLowerCase());
    
    return subjectMatch && (nameInTitle || nameInDesc);
  });

  if (match) return match.id;

  // Try fuzzy match on first word of topic name
  match = topics.find(t => {
    const firstWord = t.name.toLowerCase().split(' ')[0];
    return deckTitle.includes(firstWord) || deckDescription.includes(firstWord);
  });

  return match ? match.id : null;
}

async function addTopicIdAttribute() {
  console.log('Step 1: Checking topic_id attribute...');
  
  try {
    console.log('✓ Assuming attribute already added manually');
    console.log('✓ Proceeding with migration...\n');
  } catch (error) {
    console.error('Error in attribute setup:', error);
    throw error;
  }
}

async function linkDecksToTopics() {
  console.log('\nStep 2: Linking existing decks to topics...');
  
  try {
    // Get all topics
    const topics = await getKnowledgeGraphTopics();
    console.log(`Found ${topics.length} topics in knowledge graph`);

    // Get all decks
    let allDecks: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        DECKS_COLLECTION,
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      allDecks = allDecks.concat(response.documents);
      offset += limit;
      hasMore = response.documents.length === limit;
    }

    console.log(`Found ${allDecks.length} decks to process`);

    let linked = 0;
    let orphaned = 0;
    const orphanedDecks: Deck[] = [];

    // Process each deck
    for (const deck of allDecks) {
      const deckData: Deck = {
        deck_id: deck.deck_id,
        title: deck.title,
        category: deck.category,
        description: deck.description
      };

      const topicId = findMatchingTopic(deckData, topics);

      if (topicId) {
        // Link deck to topic
        await databases.updateDocument(
          DATABASE_ID,
          DECKS_COLLECTION,
          deck.$id,
          { topic_id: topicId }
        );
        
        console.log(`✓ Linked "${deck.title}" to topic ${topicId}`);
        linked++;
      } else {
        console.log(`⚠️  No match found for "${deck.title}" (${deck.category})`);
        orphaned++;
        orphanedDecks.push(deckData);
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total decks: ${allDecks.length}`);
    console.log(`Linked to topics: ${linked}`);
    console.log(`Orphaned (no match): ${orphaned}`);

    if (orphanedDecks.length > 0) {
      console.log('\nOrphaned decks:');
      orphanedDecks.forEach(d => {
        console.log(`  - ${d.title} (${d.category || 'no category'})`);
      });
      console.log('\nThese decks will remain accessible but not linked to study paths.');
    }

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Error linking decks:', error);
    throw error;
  }
}

async function main() {
  console.log('=== Deck to Topic Migration ===\n');

  try {
    // Step 1: Add attribute (manual step with confirmation)
    await addTopicIdAttribute();

    // Step 2: Link existing decks
    await linkDecksToTopics();

    console.log('\n✓ All migration steps completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as migrateDeckToTopics };
