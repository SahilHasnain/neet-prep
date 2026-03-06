import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = 'flashcard_db';
const COLLECTION_ID = 'study_notes';

async function setupStudyNotesCollection() {
  try {
    console.log('Creating study_notes collection...');

    await databases.createCollection(
      DATABASE_ID,
      COLLECTION_ID,
      'Study Notes',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    console.log('Collection created successfully');

    // Create attributes
    const attributes = [
      { key: 'note_id', type: 'string', size: 100, required: true },
      { key: 'user_id', type: 'string', size: 100, required: true },
      { key: 'topic_id', type: 'string', size: 100, required: true },
      { key: 'content', type: 'string', size: 5000, required: true },
      { key: 'is_highlighted', type: 'boolean', required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ];

    for (const attr of attributes) {
      console.log(`Creating attribute: ${attr.key}`);
      
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          attr.key,
          attr.size!,
          attr.required
        );
      } else if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          attr.key,
          attr.required
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          attr.key,
          attr.required
        );
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log('All attributes created');

    // Create indexes
    console.log('Creating indexes...');

    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'user_topic_idx',
      'key',
      ['user_id', 'topic_id']
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    await databases.createIndex(
      DATABASE_ID,
      COLLECTION_ID,
      'highlighted_idx',
      'key',
      ['user_id', 'is_highlighted']
    );

    console.log('Setup complete!');
  } catch (error: any) {
    console.error('Setup error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

setupStudyNotesCollection();
