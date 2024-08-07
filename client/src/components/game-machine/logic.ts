import { pads } from '../../components/pad-controller/schema';
import type { PadId } from '../../components/pad-controller';
import { delay } from '../../utils/delay';
import { sequencer } from '../../services/sequencer';
import type { GameMachineState } from './types';

/** A generic buffer to prevent feedback from happening to quickly for user */
const TIMING_BUFFER_MS = 500;

export const NEW_GAME_STATE: GameMachineState = {
  state: 'newGame',
  userSeqIndex: 0,
  userScore: 0,
};

export const gameLogic = {
  checkInput: (padId: PadId, currentIndex: number): boolean => {
    console.log(pads[padId].tone === sequencer.valueAt(currentIndex));
    return pads[padId].tone === sequencer.valueAt(currentIndex);
  },
  isSequenceComplete: (currentIndex: number): boolean => {
    console.log(currentIndex !== 0 && currentIndex === sequencer.length);
    return currentIndex !== 0 && currentIndex === sequencer.length;
  },
  nextSequence: async () => {
    sequencer.addRandomNote(Object.values(pads).map((p) => p.tone));
    // play sequence after a short delay to ensure all is scheduled
    return delay(TIMING_BUFFER_MS, () => sequencer.playSequence());
  },
};
