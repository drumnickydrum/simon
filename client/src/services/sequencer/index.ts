import * as Tone from "tone";
import { PadId } from "../../components/gamepad/types";
import { pads } from "../../components/gamepad/schema";
import { padToneToPadId } from "../../utils/pads";
import { MonoSynth } from "./mono-synth";

const INIT_NOTE_DURATION_S = 0.3;

class Sequencer {
  private transport = Tone.getTransport();
  private synth = new MonoSynth();

  // todo: allow tempo changes
  get noteDurationS() {
    return INIT_NOTE_DURATION_S;
  }
  get noteDurationMs() {
    return INIT_NOTE_DURATION_S * 1000;
  }

  private sequence = new Tone.Sequence((time, note) => {
    this.synth.playNote({ note, duration: this.noteDurationS, time });
    Tone.getDraw().schedule(() => {
      const padId = padToneToPadId(note);
      padId && this.onPlaySynthComputer(padId);
    }, time);
  }, []);

  constructor() {
    this.sequence.loop = false;
  }

  get sequenceLength() {
    return this.sequence.events.length;
  }
  valueAt(index: number) {
    return this.sequence.events[index];
  }

  /** Caller can set a callback which will fire whenever the computer plays a pad */
  setOnPlaySynthComputer(onPlaySynthComputer: (padId: PadId) => void) {
    this.onPlaySynthComputer = onPlaySynthComputer;
  }
  private onPlaySynthComputer: (padId: PadId) => void = () => {
    throw new Error("onPlaySynthComputer has not been initialized");
  };

  playSynthUser(padId: PadId) {
    this.stopSequence();
    this.synth.playNote({
      note: pads[padId].tone,
      duration: this.noteDurationS,
    });
  }

  addRandomNoteToSequence() {
    const tones = Object.values(pads).map((p) => p.tone);
    const index = Math.floor(Math.random() * 4);
    const padTone = tones[index];
    this.sequence.events.push(padTone);
  }

  resetSequence() {
    this.sequence.clear();
    this.sequence.events = [];
  }

  private sequenceCompleteId = 0;

  /** plays the sequence and resolves when complete */
  async playSequence() {
    this.stopSequence();
    return new Promise((res) => {
      const sequenceDuration = this.sequenceLength * this.noteDurationS;
      this.sequenceCompleteId = this.transport.schedule(() => {
        this.stopSequence();
        res(undefined);
      }, sequenceDuration);
      this.sequence.start();
      this.transport.start();
    });
  }

  stopSequence() {
    this.sequence.stop(0);
    this.transport.stop(Tone.now());
    this.transport.clear(this.sequenceCompleteId);
    this.transport.position = 0;
  }
}

export const sequencer = new Sequencer();