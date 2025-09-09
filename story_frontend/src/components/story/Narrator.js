/**
 * Simple narration helper. Uses Web Speech API if available; falls back to Howler tone.
 */
import { Howl } from 'howler';

// PUBLIC_INTERFACE
export function narrateText(text, voiceName) {
  /** Narrate given text via Web Speech if available, else play a cue. */
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (voiceName) {
      const match = voices.find(v => v.name === voiceName);
      if (match) utter.voice = match;
    }
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    return;
  }
  // Fallback: a short sound cue
  const sound = new Howl({ src: ['data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA...'], volume: 0.3 });
  sound.play();
}
