import * as Tone from 'tone';

const startAudioContext = async () => {
  await Tone.start();
  console.log('audio is ready');
  document.removeEventListener('keydown', startAudioContext);
  document.removeEventListener('touchend', startAudioContext);
  document.removeEventListener('click', startAudioContext);
};

/** Due to auto-play policy on chrome, the audio context can only be started on
 * a user interaction. These events are considered a user interaction. */
export const initAudioContext = () => {
  document.addEventListener('keydown', startAudioContext);
  document.addEventListener('touchend', startAudioContext);
  document.addEventListener('click', startAudioContext);
};
