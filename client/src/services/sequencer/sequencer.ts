import * as Tone from 'tone';
import type { NoteOctave } from './types';
import { melodies, MELODY_LENGTH_MS } from './melodies';
import { delay } from '../../utils/delay';
import { melodySynth, sequenceSynth } from './synths';

const INIT_NOTE_DURATION_S = 0.3;

class Sequencer {
  private _transport = Tone.getTransport();

  // todo: allow tempo changes
  get noteDuration() {
    return { s: INIT_NOTE_DURATION_S, ms: INIT_NOTE_DURATION_S * 1000 };
  }

  constructor() {
    this._sequence.loop = false;
    // we start our sequence at 0,
    // and use transport start/stop for playback
    this._sequence.start(0);
  }
  private _sequence = new Tone.Sequence((time, note) => {
    sequenceSynth.playNote({
      note,
      duration: this.noteDuration.s,
      time,
    });
    Tone.getDraw().schedule(() => {
      sequenceSynth.notify(note);
    }, time);
  }, []);

  private _sequenceCompleteId = 0;

  public sequence = {
    length: () => this._sequence.events.length,
    valueAt: (index: number) => {
      return this._sequence.events[index];
    },
    addRandomNote: (notes: NoteOctave[]) => {
      const index = Math.floor(Math.random() * notes.length);
      const note = notes[index];
      this._sequence.events.push(note);
    },
    reset: () => {
      this._sequence.clear();
      this._sequence.events = [];
    },
    /** plays the sequence and resolves when complete */
    play: async () => {
      this.sequence.stop();
      return new Promise((res) => {
        const sequenceDuration = this.sequence.length() * this.noteDuration.s;
        this._sequenceCompleteId = this._transport.schedule(() => {
          this.sequence.stop();
          res(undefined);
        }, sequenceDuration);
        // best to start the transport a little late
        // https://github.com/Tonejs/Tone.js/wiki/Performance#scheduling-in-advance
        this._transport.start('+0.1');
      });
    },
    stop: () => {
      this._transport.stop(Tone.now());
      this._transport.clear(this._sequenceCompleteId);
      this._transport.position = 0;
    },
  };

  async playMelody(melody: keyof typeof melodies) {
    // this effectively stops the sequencer if playing
    this._sequence.mute = true;
    sequenceSynth.mute();
    // let the last note trail off a bit before playing
    await delay(this.noteDuration.ms / 3);
    const melodyNotes = melodies[melody];
    const now = Tone.now();
    for (const { note, duration, offset } of melodyNotes) {
      melodySynth.playNote({
        note,
        duration,
        time: now + offset,
      });
    }
    // unmute the sequencer for next playback
    delay(MELODY_LENGTH_MS, () => {
      sequenceSynth.unMute();
      this._sequence.mute = false;
    });
  }
}

export const sequencer = new Sequencer();
