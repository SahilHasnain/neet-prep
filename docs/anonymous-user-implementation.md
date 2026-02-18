# Anonymous User Implementation

## Overview

Implemented a unique user ID system for anonymous users that persists across app sessions until authentication is implemented.

## Changes Made

### 1. User ID Utility (`src/utils/user-id.ts`)

- Created a utility to generate and persist unique user IDs using AsyncStorage
- Each user gets a unique ID in format: `user_{timestamp}_{random}`
- ID persists across app sessions
- Includes `clearUserId()` function for testing/debugging

### 2. Updated Screens

All screens now use the persistent user ID instead of hardcoded `"temp-user-123"`:

- `app/index.tsx` - Home screen
- `app/templates/index.tsx` - Templates screen
- `app/study/[deckId].tsx` - Study mode screen
- `app/deck/[deckId].tsx` - Deck detail screen

### 3. Empty State Enhancement

Added to home screen (`app/index.tsx`):

- Simplified empty state with two clear action buttons:
  - "Create Deck" (primary button)
  - "Browse Templates" (secondary button)
- Dev flag `FORCE_EMPTY_STATE` to test empty state even with existing decks

## Installation

Install the required dependency:

```bash
npm install @react-native-async-storage/async-storage
```

## Testing Empty State

To test the empty state UI:

1. Open `app/index.tsx`
2. Change `FORCE_EMPTY_STATE` from `false` to `true`
3. Reload the app

## How It Works

1. On first app launch, a unique user ID is generated and stored in AsyncStorage
2. All subsequent app sessions use the same user ID
3. All user data (decks, flashcards, progress) is associated with this ID
4. When authentication is implemented, data can be migrated to authenticated user accounts

## Future Migration

When implementing authentication:

1. Retrieve the anonymous user ID
2. Associate all data with the new authenticated user
3. Clear the anonymous user ID
4. Use authenticated user ID going forward
