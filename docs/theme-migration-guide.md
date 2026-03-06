# Theme Migration Guide

## Overview
We've centralized the theme configuration to maintain consistency and make future updates easier.

## Files Created
1. **tailwind.config.js** - Extended with custom colors, spacing, and utilities
2. **src/config/theme.config.ts** - Programmatic access to theme values

## How to Use

### Option 1: Tailwind Classes (Recommended for JSX)
Use the custom color names directly in className:

```tsx
// Before
<View className="bg-blue-600 text-white" />

// After
<View className="bg-primary-600 text-white" />
```

### Option 2: Theme Constants (For Programmatic Use)
Import from theme.config.ts when you need colors in JavaScript:

```tsx
import { COLORS, getSubjectColor, THEME_CLASSES } from '@/config/theme.config';

// Direct color access
<View style={{ backgroundColor: COLORS.primary[600] }} />

// Helper functions
const color = getSubjectColor('Physics'); // Returns physics color object
const scoreColor = getScoreColor(85); // Returns success color

// Reusable class patterns
<View className={THEME_CLASSES.card} />
<Text className={THEME_CLASSES.heading1}>Title</Text>
```

## Custom Theme Colors

### Brand Colors
- **primary** - Blue (main brand color)
- **secondary** - Purple (accent color)

### Subject Colors
- **physics** - Blue
- **chemistry** - Green  
- **biology** - Purple

### Status Colors
- **success** - Green
- **warning** - Yellow/Orange
- **error** - Red
- **info** - Blue

## Migration Examples

### Example 1: Card Component
```tsx
// Before
<View className="bg-white rounded-2xl p-6 mb-4">

// After (using Tailwind)
<View className="bg-white rounded-2xl p-6 mb-4">
// OR
<View className={THEME_CLASSES.cardLarge + ' mb-4'}>
```

### Example 2: Subject-based Styling
```tsx
// Before
<View className="bg-blue-600" /> // Physics
<View className="bg-green-600" /> // Chemistry
<View className="bg-purple-600" /> // Biology

// After
<View className="bg-physics-600" />
<View className="bg-chemistry-600" />
<View className="bg-biology-600" />
```

### Example 3: Status Colors
```tsx
// Before
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

// After
import { getScoreColor } from '@/config/theme.config';
const color = getScoreColor(score); // Returns color object
// Use in style prop or convert to className
```

### Example 4: Buttons
```tsx
// Before
<TouchableOpacity className="bg-blue-600 rounded-xl p-4 items-center">

// After
<TouchableOpacity className="bg-primary-600 rounded-xl p-4 items-center">
// OR
<TouchableOpacity className={THEME_CLASSES.buttonPrimary}>
```

### Example 5: Gradients
```tsx
// Before
<View className="bg-gradient-to-br from-blue-500 to-purple-600">

// After
<View className="bg-gradient-to-br from-primary-500 to-secondary-600">
// OR
import { GRADIENTS } from '@/config/theme.config';
<View className={`bg-gradient-to-br ${GRADIENTS.primary}`}>
```

## Migration Priority

### High Priority (Most Used)
1. Primary/Secondary colors (blue-600 → primary-600, purple-600 → secondary-600)
2. Subject colors (Physics, Chemistry, Biology)
3. Status colors (success, warning, error)

### Medium Priority
1. Card styles
2. Button styles
3. Text styles

### Low Priority
1. One-off custom colors
2. Spacing adjustments
3. Border radius variations

## Benefits

1. **Consistency** - All components use the same color palette
2. **Maintainability** - Change theme in one place
3. **Type Safety** - TypeScript autocomplete for theme values
4. **Flexibility** - Easy to add dark mode or theme variants later
5. **Performance** - No runtime color calculations

## Notes

- Don't migrate everything at once - do it gradually per feature/screen
- Test each migration to ensure colors look correct
- Keep the old hardcoded values until migration is complete
- Document any custom color choices that deviate from theme
