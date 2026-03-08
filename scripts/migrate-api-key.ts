import * as dotenv from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;

async function migrateApiKey() {
  try {
    const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

    if (!groqApiKey) {
      console.error('❌ EXPO_PUBLIC_GROQ_API_KEY not found in .env.local');
      console.log('Please add your GROQ API key to .env.local file');
      return;
    }

    console.log('Migrating GROQ API key to Appwrite...');

    // Check if key already exists
    const existing = await databases.listDocuments(
      databaseId,
      'api-keys'
    );

    const existingKey = existing.documents.find(doc => doc.key_name === 'GROQ_API_KEY');

    if (existingKey) {
      console.log('⚠️  GROQ_API_KEY already exists in Appwrite');
      console.log('Updating existing key...');
      
      await databases.updateDocument(
        databaseId,
        'api-keys',
        existingKey.$id,
        {
          key_value: groqApiKey,
          description: 'Groq API key for AI-powered study features',
          is_active: true
        }
      );
      
      console.log('✅ API key updated successfully!');
    } else {
      // Create new document
      await databases.createDocument(
        databaseId,
        'api-keys',
        ID.unique(),
        {
          key_name: 'GROQ_API_KEY',
          key_value: groqApiKey,
          description: 'Groq API key for AI-powered study features',
          is_active: true
        }
      );

      console.log('✅ API key migrated successfully!');
    }

    console.log('\n📝 Next steps:');
    console.log('1. Verify the key in Appwrite Console → api-keys collection');
    console.log('2. You can now remove EXPO_PUBLIC_GROQ_API_KEY from .env.local (optional)');
    console.log('3. The app will automatically fetch the key from Appwrite');

  } catch (error: any) {
    console.error('❌ Error migrating API key:', error.message);
    throw error;
  }
}

migrateApiKey();
