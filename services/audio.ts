import { Audio } from 'expo-av';

export type SoundName = 'correct' | 'wrong' | 'complete' | 'tap';

// Add licensed .mp3 files to assets/audio before production builds.
const sounds: Record<SoundName, number | undefined> = {
  correct: undefined,
  wrong: undefined,
  complete: undefined,
  tap: undefined,
};

let music: Audio.Sound | null = null;

export async function configureAudio() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

export async function playEffect(name: SoundName) {
  const source = sounds[name];
  if (!source) return;
  const sound = new Audio.Sound();
  try {
    await sound.loadAsync(source);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    });
  } catch (error) {
    console.warn(`Could not play ${name}`, error);
  }
}

export async function startMusic(source: number) {
  await stopMusic();
  music = new Audio.Sound();
  await music.loadAsync(source, { isLooping: true, volume: 0.25 });
  await music.playAsync();
}

export async function stopMusic() {
  if (!music) return;
  await music.stopAsync().catch(() => undefined);
  await music.unloadAsync().catch(() => undefined);
  music = null;
}
