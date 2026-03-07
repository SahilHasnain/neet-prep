# Video ID and Topic ID Guide

## Topic IDs (Use these in the admin panel)

### Physics Topics
```
phy_001 - Units and Measurements
phy_002 - Kinematics
phy_003 - Laws of Motion
phy_004 - Work, Energy and Power
phy_005 - Rotational Motion
phy_006 - Gravitation
phy_007 - Properties of Matter
phy_008 - Thermodynamics
phy_009 - Oscillations
phy_010 - Waves and Sound
phy_011 - Electrostatics
phy_012 - Current Electricity
phy_013 - Magnetism
phy_014 - Electromagnetic Induction
phy_015 - Optics
phy_016 - Modern Physics
```

### Chemistry Topics
```
chem_001 - Basic Concepts
chem_002 - Atomic Structure
chem_003 - States of Matter
chem_004 - Thermodynamics
chem_005 - Chemical Equilibrium
chem_006 - Redox Reactions
chem_007 - Chemical Kinetics
chem_008 - Organic Chemistry Basics
chem_009 - Hydrocarbons
chem_010 - Biomolecules
```

### Biology Topics
```
bio_001 - Living World and Classification
bio_002 - Cell Structure
bio_003 - Biomolecules
bio_004 - Cell Division
bio_005 - Genetics
bio_006 - Molecular Basis of Inheritance
bio_007 - Evolution
bio_008 - Human Physiology
bio_009 - Plant Physiology
bio_010 - Ecology
```

## Video ID Format

**Pattern:** `{topic_id}_v{number}`

### Examples:
```
phy_001_v1  - First video for Units and Measurements
phy_001_v2  - Second video for Units and Measurements
phy_002_v1  - First video for Kinematics
chem_001_v1 - First video for Basic Concepts
bio_001_v1  - First video for Living World
```

## YouTube ID

This is the unique identifier from YouTube URLs:

**YouTube URL formats:**
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → YouTube ID: `dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ` → YouTube ID: `dQw4w9WgXcQ`

**How to find it:**
1. Go to the YouTube video
2. Copy the URL
3. Extract the part after `v=` or after `youtu.be/`

## Example: Adding a New Video

Let's say you want to add a video for "Kinematics" topic:

1. **Video ID:** `phy_002_v2` (if it's the 2nd video for this topic)
2. **Topic ID:** `phy_002` (from the list above)
3. **Title:** "Kinematics - Projectile Motion Explained"
4. **Channel:** "Physics Wallah"
5. **YouTube ID:** Get from YouTube URL (e.g., `abc123xyz`)
6. **Duration:** "25:30" (format: MM:SS or HH:MM:SS)
7. **Difficulty:** beginner/intermediate/advanced
8. **Language:** english/hindi/both
9. **Order Index:** 1 (if second video, use 1; first video is 0)

## Quick Reference

| Field | Example | Notes |
|-------|---------|-------|
| Video ID | `phy_002_v2` | Unique, follows pattern |
| Topic ID | `phy_002` | Must match existing topic |
| YouTube ID | `dQw4w9WgXcQ` | From YouTube URL |
| Duration | `25:30` or `1:25:30` | Minutes:Seconds or Hours:Minutes:Seconds |
| Order Index | `0`, `1`, `2`... | Display order (0 = first) |

## Tips

- Keep video IDs consistent with the pattern
- Use order_index to control display sequence
- Set is_active to false for videos you want to hide temporarily
- Use descriptive titles that include the topic name
- Add proper descriptions to help students choose videos
