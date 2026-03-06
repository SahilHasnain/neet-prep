# Study Path Revert Feature

## Overview

Users can now generate new study paths without losing their previous progress. The system automatically archives old paths and allows reverting to them if needed.

## How It Works

### 1. Path Archiving
When generating a new study path:
- Existing active path is automatically marked as `archived`
- New path is created with status `active`
- All topic progress from old path is preserved
- User can continue from where they left off if they revert

### 2. Path Statuses

```typescript
type PathStatus = 
  | 'active'    // Current study path
  | 'completed' // Finished all topics
  | 'paused'    // Temporarily stopped
  | 'archived'  // Replaced by new path, can be restored
  | 'replaced'  // Was active, then user reverted to older path
```

### 3. Revert Process

When user reverts to previous path:
1. Current active path → marked as `replaced`
2. Most recent archived path → marked as `active`
3. All topic progress is restored
4. User continues from their previous position

## User Flow

### Generating New Path

1. User completes diagnostic test
2. Clicks "Generate AI-Powered Study Path"
3. If existing path exists:
   - Alert: "Replace Study Path?"
   - Message: "You already have an active study path. Generating a new one will archive your current path. You can revert to it later if needed."
   - Options: Cancel | Replace
4. Old path archived, new path created

### Reverting to Previous Path

1. User navigates to Study Path screen
2. If archived paths exist, "Revert to Previous Path" button appears
3. User clicks revert button
4. Alert: "Revert to Previous Path?"
5. Confirms → Previous path restored

## API Methods

### Archive Active Path
```typescript
// Automatically called when generating new path
private static async archiveActiveStudyPath(userId: string): Promise<void>
```

### Revert to Previous
```typescript
StudyPathService.revertToPreviousPath(userId: string): Promise<StudyPath | null>
```

### Get All Paths
```typescript
StudyPathService.getAllUserStudyPaths(userId: string): Promise<StudyPath[]>
```

## UI Components

### Results Screen
- Checks for existing path on mount
- Shows confirmation dialog before replacing
- Explains archiving and revert option

### Study Path Screen
- Checks for archived paths on mount
- Shows "Revert to Previous Path" button if available
- Orange accent color to distinguish from other actions

## Database Changes

### Status Enum Update
The `status` attribute in `study_paths` collection now includes:
- `archived` - Path was replaced but can be restored
- `replaced` - Path was active but user reverted to older one

### Manual Update Required
Update the status enum in Appwrite Console:
1. Navigate to Database > study_paths collection
2. Update status attribute to include all 5 values
3. Or delete and recreate with new enum values

## Benefits

### For Users
- **No Fear of Loss**: Can try new paths without losing progress
- **Flexibility**: Switch between paths based on needs
- **Safety Net**: Easy to undo if new path doesn't work
- **Experimentation**: Try different diagnostic results

### For Learning
- **Continuity**: Preserve learning progress
- **Comparison**: See which path works better
- **Adaptation**: Adjust strategy without starting over

## Example Scenarios

### Scenario 1: Retake After Improvement
1. Student completes diagnostic → Path A created
2. Studies for 2 weeks, improves in Physics
3. Retakes diagnostic → Path B created (Path A archived)
4. Path B focuses more on Chemistry/Biology
5. Student prefers Path A approach → Reverts
6. Continues Path A from week 2

### Scenario 2: Accidental Regeneration
1. Student has active path with 50% progress
2. Accidentally clicks "Generate New Path"
3. Realizes mistake immediately
4. Clicks "Revert to Previous Path"
5. Back to 50% progress, no data lost

### Scenario 3: Strategy Change
1. Path A: Comprehensive (15 topics, 12 weeks)
2. Path B: Focused (8 topics, 6 weeks) - exam in 2 months
3. Student tries Path B, too rushed
4. Reverts to Path A, better pacing

## Limitations

- Only most recent archived path can be restored
- Replaced paths cannot be restored (only archived ones)
- Maximum 10 paths stored per user (oldest auto-deleted)

## Future Enhancements

1. **Multiple Revert Levels**: Restore any previous path, not just last one
2. **Path Comparison**: Side-by-side view of different paths
3. **Merge Paths**: Combine progress from multiple paths
4. **Path Templates**: Save successful paths as templates
5. **Path Analytics**: Show which path led to better outcomes

## Testing Checklist

- [ ] Generate first path (no existing path)
- [ ] Generate second path (shows confirmation)
- [ ] Cancel replacement (keeps old path)
- [ ] Confirm replacement (archives old path)
- [ ] Revert button appears after replacement
- [ ] Revert restores previous path
- [ ] Topic progress preserved after revert
- [ ] Multiple generate/revert cycles work
- [ ] No data loss in any scenario

## Code Files Modified

1. `src/services/study-path.service.ts`
   - Added `archiveActiveStudyPath()`
   - Added `revertToPreviousPath()`
   - Added `getAllUserStudyPaths()`
   - Modified `generateStudyPath()` to auto-archive

2. `app/diagnostic/results.tsx`
   - Added existing path check
   - Added confirmation dialog
   - Split generation into separate function

3. `app/study-path/index.tsx`
   - Added archived path check
   - Added revert button
   - Added revert confirmation dialog

4. `src/types/study-path.types.ts`
   - Updated status enum with new values

## Conclusion

The revert feature provides a safety net for users, encouraging them to experiment with different study paths while preserving their progress. This reduces anxiety about making the "wrong" choice and promotes adaptive learning strategies.
