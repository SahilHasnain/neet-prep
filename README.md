# Naat Collection - Flashcard App

A React Native flashcard application with AI-powered card generation using Appwrite backend and GROQ AI.

## Features

- 📚 Create and manage flashcard decks
- 🤖 AI-powered flashcard generation using GROQ
- 📊 Track learning progress with spaced repetition
- 🎯 Multiple difficulty levels
- 🏷️ Tag-based organization
- 📱 Cross-platform (iOS, Android, Web)

## Tech Stack

- **Frontend**: React Native (Expo), TypeScript, NativeWind
- **Backend**: Appwrite (Database, Functions, Authentication)
- **AI**: GROQ API
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Appwrite account
- GROQ API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env.local`:

```env
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_ENDPOINT=your_endpoint
APPWRITE_API_KEY=your_api_key
GROQ_API_KEY=your_groq_key
```

4. Set up Appwrite database:

```bash
npm run setup:database
```

5. Deploy Appwrite function (see `docs/phase1-setup-guide.md`)

6. Start the development server:

```bash
npm start
```

## Project Structure

```
├── app/                    # Expo Router pages
├── src/
│   ├── config/            # Configuration files
│   ├── types/             # TypeScript type definitions
│   ├── services/          # API services (Phase 3)
│   ├── hooks/             # Custom React hooks (Phase 3)
│   ├── components/        # Reusable components (Phase 3)
│   └── utils/             # Utility functions (Phase 3)
├── appwrite-functions/    # Appwrite serverless functions
├── scripts/               # Setup and utility scripts
└── docs/                  # Documentation
```

## Documentation

- [Implementation Plan](docs/flashcard-feature-plan.md)
- [Phase 1 Setup Guide](docs/phase1-setup-guide.md)
- [Database Schema](docs/database-schema.md)
- [Function Documentation](appwrite-functions/generate-flashcards/README.md)

## Development Phases

- ✅ Phase 1: Backend Infrastructure & Database Setup
- ⏳ Phase 2: Appwrite Function & AI Integration
- ⏳ Phase 3: Frontend Implementation

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run setup:database` - Set up Appwrite database
- `npm run lint` - Run ESLint

## License

Private
