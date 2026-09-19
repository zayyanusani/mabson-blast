# Audio assets

Add properly licensed files here before a production build:

- `correct.mp3`
- `wrong.mp3`
- `complete.mp3`
- `tap.mp3`
- `background.mp3`

The app configures `expo-av` and fails gracefully when optional audio is unavailable. Update `services/audio.ts` to import the files with `require('../assets/audio/correct.mp3')` and similar imports after adding them. Do not commit copyrighted music without permission.
