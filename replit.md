# KnockBase - Door-to-Door Sales App

## Overview
KnockBase is a mobile-first door-to-door sales tracking application built with Expo/React Native. It helps sales reps manage leads, track visits, and optimize their daily canvassing routes.

## Recent Changes
- 2026-02-14: Added territory mapping (draw polygon boundaries, assign reps, color-coded overlays)
- 2026-02-14: Added map picker for selecting house locations by tapping the map when creating leads
- 2026-02-14: Added lead-to-lead navigation (prev/next arrows) on the map preview card
- 2026-02-14: Added territory toggle button on map to show/hide territory overlays
- 2026-02-14: Initial build with lead management, map view, route planning, dashboard

## Architecture
- **Frontend**: Expo Router (file-based routing) with React Native
- **State**: AsyncStorage for local persistence, React Context for shared state
- **Styling**: StyleSheet with Inter font family, custom color theme
- **Maps**: react-native-maps v1.18.0 (Expo Go compatible)

### Key Files
- `lib/types.ts` - Lead, DailyStats, Territory types and status/color config
- `lib/storage.ts` - AsyncStorage CRUD for leads and territories
- `lib/leads-context.tsx` - React Context for lead state management
- `lib/territories-context.tsx` - React Context for territory state management
- `lib/useTheme.ts` - Theme hook for dark/light mode
- `app/(tabs)/index.tsx` - Map view with pins, territory overlays, lead navigation
- `app/(tabs)/leads.tsx` - Leads list with search/filter/sort
- `app/(tabs)/route.tsx` - Route optimization view
- `app/(tabs)/dashboard.tsx` - Stats dashboard
- `app/lead-detail.tsx` - Lead detail screen
- `app/lead-form.tsx` - Create/edit lead form (with "Pick on Map" button)
- `app/map-picker.tsx` - Full-screen map to tap and select a house location
- `app/territory-editor.tsx` - Draw territory polygons, name them, assign reps
- `components/NativeMap.tsx` / `.web.tsx` - Platform-specific map with territory overlays
- `components/MapPickerNative.tsx` / `.web.tsx` - Platform-specific map picker
- `components/TerritoryEditorNative.tsx` / `.web.tsx` - Platform-specific territory editor
- `components/` - Reusable UI components

### Platform Pattern
- `react-native-maps` is native-only. All map components have `.web.tsx` variants that render fallbacks.
- Route files (e.g. `map-picker.tsx`) check `Platform.OS === "web"` and delegate to platform-specific component imports.

### Lead Statuses
Untouched, Not Home, Not Interested, Callback, Appointment, Sold, Follow Up

## User Preferences
- Professional sales tool aesthetic
- Dark/light mode support
- Emerald green primary accent (#10B981)
