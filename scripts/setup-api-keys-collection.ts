import * as dotenv from 'dotenv';
import { Client, Databases, Permission, Role } from 'node-appwrite';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;

async function setupApiKeysCollection() {
  try {
    console.log('Creating api-keys collection...');

    // Create the collection
    const collection = await databases.createCollection(
      databaseId,
      'api-keys',
      'API Keys',
      [
        Permission.read(Role.any()),
      ]
    );

    console.log('✓ Collection created:', collection.$id);

    // Create attributes
    await databases.createStringAttribute(
      databaseId,
      'api-keys',
      'key_name',
      255,
      true
    );
    console.log('✓ Created key_name attribute');

    await databases.createStringAttribute(
      databaseId,
      'api-keys',
      'key_value',
      1000,
      true
    );
    console.log('✓ Created key_value attribute');

    await databases.createStringAttribute(
      databaseId,
      'api-keys',
      'description',
      500,
      false
    );
    console.log('✓ Created description attribute');

    await databases.createBooleanAttribute(
      databaseId,
      'api-keys',
      'is_active',
      true
    );
    console.log('✓ Created is_active attribute');

    // Wait for attributes to be available
    console.log('\nWaiting for attributes to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create index for key_name
    await databases.createIndex(
      databaseId,
      'api-keys',
      'key_name_index',
      'unique' as any,
      ['key_name'],
      ['ASC']
    );
    console.log('✓ Created index on key_name');

    console.log('\n✅ API Keys collection setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to Appwrite Console');
    console.log('2. Navigate to the api-keys collection');
    console.log('3. Add your API keys as documents with:');
    console.log('   - key_name: "GROQ_API_KEY" (or "OPENAI_API_KEY", "GEMINI_API_KEY")');
    console.log('   - key_value: your actual API key');
    console.log('   - description: optional description');
    console.log('   - is_active: true');

  } catch (error: any) {
    if (error.code === 409) {
      console.log('Collection already exists. Checking attributes...');
    } else {
      console.error('Error setting up collection:', error);
      throw error;
    }
  }
}

setupApiKeysCollection();
