# Quick Start - Admin Panel

## ✅ Setup Complete!

The video management system is now ready to use.

## What Was Done

1. ✅ Created `video_lessons` collection in Appwrite
2. ✅ Migrated 8 existing videos to database
3. ✅ Set up Next.js admin panel
4. ✅ Configured environment variables
5. ✅ Created shared types and services

## Start Admin Panel

```bash
cd admin
npm run dev
```

Then open: http://localhost:3000

## Features Available

- **Dashboard:** View stats and navigate to video management
- **Video Management:** `/videos` route
  - View all videos grouped by topic
  - Search videos by title, topic, or channel
  - Add new videos
  - Edit existing videos
  - Delete videos
  - Toggle active/inactive status

## Current Videos in Database

- **Physics (3 topics, 4 videos)**
  - phy_001: Units and Measurements (2 videos)
  - phy_002: Kinematics (1 video)
  - phy_008: Thermodynamics (1 video)

- **Chemistry (2 topics, 2 videos)**
  - chem_001: Basic Concepts (1 video)
  - chem_005: Chemical Thermodynamics (1 video)

- **Biology (2 topics, 2 videos)**
  - bio_001: Living World (1 video)
  - bio_005: Mendelian Genetics (1 video)

## Mobile App

The mobile app automatically fetches videos from the database now. No changes needed!

## Next Steps

1. Start the admin panel and explore the UI
2. Add real YouTube video IDs (currently using placeholder)
3. Add more videos for other topics
4. Test video playback in mobile app

## Troubleshooting

If admin panel doesn't load:
1. Check `admin/.env.local` exists with correct credentials
2. Verify Appwrite connection
3. Check console for errors

If mobile app doesn't show videos:
1. Ensure videos have `is_active: true`
2. Check topic_id matches your topics
3. Verify Appwrite permissions allow read access
