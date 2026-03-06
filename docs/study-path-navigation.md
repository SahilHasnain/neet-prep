# Study Path Feature - Navigation Guide

## How to Access the Study Path Feature

### 1. From Home Screen (Main Entry Points)

#### Quick Actions Bar
At the top of the home screen, you'll see three quick action buttons:
- **Study Path** (purple map icon) - Direct access to study path feature
- **Templates** (blue albums icon) - Browse flashcard templates
- **Insights** (green analytics icon) - View learning insights

#### Empty State (First-time Users)
When you have no decks created, the home screen shows:
1. **Primary CTA**: "Take Diagnostic Quiz" - Starts the 30-question assessment
2. **Secondary CTA**: "Create Deck Manually" - Traditional deck creation
3. **Tertiary CTA**: "Browse Templates" - Pre-made flashcard templates

### 2. Navigation Flow

```
Home Screen (/)
    ↓
Study Path Button → Study Path Screen (/study-path)
    ↓
Take Diagnostic Quiz → Diagnostic Quiz (/diagnostic)
    ↓
Complete 30 Questions
    ↓
View Results (/diagnostic/results)
    ↓
Generate Study Path → [Coming in Phase 2]
```

### 3. Screen Routes

| Screen | Route | Description |
|--------|-------|-------------|
| Home | `/` | Main dashboard with quick actions |
| Study Path | `/study-path` | Overview and entry to personalized learning |
| Diagnostic Quiz | `/diagnostic` | 30-question assessment |
| Quiz Results | `/diagnostic/results` | Score breakdown and weak/strong topics |

### 4. User Journey

**New User Flow:**
1. Opens app → Sees empty state
2. Clicks "Take Diagnostic Quiz"
3. Completes 30 questions (Physics, Chemistry, Biology)
4. Views personalized results with subject scores
5. Sees weak topics (need focus) and strong topics
6. Clicks "Generate My Personalized Study Path"
7. [Phase 2] Gets AI-generated learning roadmap

**Existing User Flow:**
1. Opens app → Sees home screen with decks
2. Clicks "Study Path" in quick actions
3. Views current study path progress
4. [Phase 2] Sees unlocked/locked topics
5. [Phase 2] Completes daily tasks
6. [Phase 2] Tracks mastery levels

### 5. Visual Indicators

**Home Screen:**
- Purple "Study Path" button with map icon
- Positioned first in quick actions (left-most)

**Empty State:**
- Large purple CTA button with map icon
- Prominent placement above manual deck creation

**Diagnostic Quiz:**
- Progress bar showing question X of 30
- Subject badges (Physics/Chemistry/Biology)
- Difficulty indicators (Easy/Medium/Hard)

**Results Screen:**
- Color-coded scores:
  - Green (80%+): Excellent
  - Blue (60-79%): Good
  - Yellow (40-59%): Keep Going
  - Red (<40%): Needs Improvement
- Subject-wise progress bars
- Weak topics in red boxes
- Strong topics in green boxes

### 6. Deep Linking (Future)

When implemented, users can share/bookmark:
- `/diagnostic` - Start diagnostic quiz
- `/diagnostic/results?id=xxx` - View specific result
- `/study-path?topic=phy_003` - Jump to specific topic
- `/study-path/daily` - Today's tasks

### 7. Navigation Best Practices

**For Users:**
- Start with diagnostic quiz if unsure where to begin
- Use quick actions for fast access to study path
- Check study path regularly for daily tasks

**For Developers:**
- All routes use Expo Router file-based routing
- Screens are in `app/` directory
- Use `router.push()` for navigation
- Pass data via route params or context

### 8. Accessibility

- All buttons have clear labels
- Icons paired with text for clarity
- Color-coding supplemented with text indicators
- Touch targets meet minimum size requirements

## Testing Navigation

To test the navigation flow:

```bash
# Start the app
npm start

# Navigate to:
1. Home screen - Should see "Study Path" button
2. Click "Study Path" - Goes to /study-path
3. Click "Take Diagnostic Quiz" - Goes to /diagnostic
4. Complete quiz - Auto-navigates to /diagnostic/results
5. Click "Generate Study Path" - [Phase 2 implementation]
```

## Next Steps

Phase 2 will add:
- Study path visualization with knowledge graph
- Topic unlock mechanics
- Daily task scheduling
- Progress tracking dashboard
- Deep linking support
