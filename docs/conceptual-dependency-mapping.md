# Conceptual Dependency Mapping - Implementation Plan

## Overview
When students struggle with a topic, automatically identify missing prerequisite knowledge and provide targeted interventions.

---

## Phase 1: Gap Detection & Analysis ✅
**Status:** COMPLETE

**Implemented:**
1. ✅ Added `ConceptualGap` type and `conceptual_gaps` field to `TopicProgress`
2. ✅ Created `GapDetectionService` with:
   - `analyzeQuizPerformance()` - Detects when students struggle (score < 60%)
   - `tracePrerequisiteGaps()` - Identifies missing prerequisites
   - `identifyWeakSubConcepts()` - Uses AI to pinpoint specific sub-concepts
   - `generateGapExplanation()` - Creates human-readable explanations
3. ✅ Enhanced quiz completion handler to detect and store gaps
4. ✅ Updated topic detail screen to display detected gaps with severity indicators
5. ✅ Added database migration script for `conceptual_gaps` field

**How it works:**
- When quiz score < 60% or mastery < 50% after 2+ attempts, gap analysis triggers
- System traces prerequisite chain and identifies root causes
- AI analyzes which specific sub-concepts are weak
- Gaps stored with severity: critical (red), moderate (orange), minor (blue)
- Student sees clear explanation of what's blocking their progress

**Next:** Run `npx ts-node scripts/add-conceptual-gaps-field.ts` to add database field

---

## Phase 2: Visual Dependency Tree & Smart Unlocking ✅
**Status:** COMPLETE

**Implemented:**
1. ✅ Created `DependencyTree` component with:
   - Visual prerequisite chain (current topic → prerequisites → deeper prerequisites)
   - Color-coded nodes: purple (current), red (critical gap), orange (moderate gap), green (completed), gray (locked)
   - Mastery progress bars on each node
   - Gap severity indicators
   - Interactive - tap nodes to navigate
   - Horizontal scrollable tree layout
2. ✅ Created `WhyLockedExplanation` component:
   - Shows why topic is locked with clear explanation
   - Lists incomplete prerequisites with progress
   - Highlights recommended next prerequisite
   - Actionable "Next Step" guidance
   - Tap prerequisites to navigate
3. ✅ Enhanced topic detail screen:
   - Added "Path" tab showing full dependency tree
   - Replaced generic lock message with detailed explanation
   - Shows gaps in Prerequisites section with severity colors
4. ✅ Updated `useStudyPath` hook to expose `allProgress` array

**How it works:**
- Students see visual knowledge path from current topic back to foundations
- Locked topics show exactly which prerequisites are incomplete
- Gap-detected prerequisites highlighted in red/orange
- One-tap navigation to prerequisite topics
- Clear "next step" recommendations

---

## Phase 3: Micro-Interventions ✅
**Status:** COMPLETE

**Implemented:**
1. ✅ Created `MicroInterventionService` with:
   - `generateIntervention()` - Creates complete intervention package
   - `generateKeyConcepts()` - 3-4 essential concepts to review
   - `generateBridgeExplanation()` - Connects prerequisite → current topic
   - `generatePracticeQuestions()` - 3-5 focused MCQs
   - `markGapResolved()` - Tracks intervention completion
2. ✅ Added Micro-Intervention Modal to topic detail screen:
   - Triggered from quiz results when gaps detected
   - "Quick Fix" buttons on detected gaps
   - Shows key concepts, bridge explanation, practice questions
   - One-tap navigation to prerequisite topic
3. ✅ Enhanced quiz completion flow:
   - Offers "Get Quick Help" when gaps detected
   - Alternative to full prerequisite review
   - Immediate, targeted intervention

**How it works:**
- When student struggles on quiz, system offers quick help
- Modal shows 3-4 key concepts to review
- Bridge explanation shows why prerequisite matters
- 3-5 practice questions test understanding
- Student can either take quick intervention or study full prerequisite
- Gaps marked as resolved after intervention

**All 3 Phases Complete!** 🎉

---

## Success Metrics
- Students understand why they're stuck (dependency clarity)
- Reduced time to identify knowledge gaps (from manual to automatic)
- Improved topic completion rates through targeted interventions
