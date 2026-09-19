# Mabson Blast 🌍

Mabson Blast is an African culture quiz game built with Expo, React Native, TypeScript and Supabase.

## Production foundation
- Persistent Supabase authentication sessions
- Email/password authentication service
- Cloud player progress sync with offline local cache
- Daily challenge data service
- XP/level calculation utilities with unit tests
- Supabase Row Level Security for player-owned data
- GitHub Actions typecheck and test gate

## Roadmap
1. Accounts and cloud sync
2. 100+ levels and daily challenges
3. Streaks, badges, timed rounds and achievements
4. Global and category leaderboards with score validation
5. Hausa/English localization and country content packs
6. Analytics, crash reporting and safe monetization
7. Android/iOS production builds and staged releases

## Development
Install dependencies, then run Expo locally. Run the typecheck and Jest suite before opening a pull request.

## Environment
Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY. Never ship a Supabase service-role key in the mobile app.

## Supabase
Run supabase/schema.sql in the Supabase SQL editor before enabling cloud features.

## Content standard
Questions should be reviewed for factual accuracy, cultural context and respectful representation before publication.
