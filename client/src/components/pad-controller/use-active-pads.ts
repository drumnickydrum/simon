import { useCallback, useEffect, useState } from 'react';
import { sequencer } from './../../services/sequencer';
import { noteToPadId } from './../../utils/pads';
import type { PadId } from './types';
import type { SequencerNoteEvent } from '../../services/sequencer/sequencer';
import { immutableSetOp } from '../../utils/set';

export const useActivePads = (resetActivePads: boolean) => {
  const [activePads, setActivePads] = useState(new Set<PadId>());
  const [reset, setReset] = useState(false);

  const add = useCallback((padId: PadId) => {
    setActivePads((prev) =>
      immutableSetOp({ set: prev, item: padId, op: 'add' }),
    );
  }, []);

  const del = useCallback((padId: PadId) => {
    setActivePads((prev) =>
      immutableSetOp({ set: prev, item: padId, op: 'delete' }),
    );
  }, []);

  if (resetActivePads !== reset) {
    setReset(resetActivePads);
    setActivePads(new Set());
  }

  useEffect(() => {
    const listener = (event: Event) => {
      const note = (event as unknown as SequencerNoteEvent).detail.note;
      const padId = noteToPadId(note);
      if (!padId) {
        return;
      }
      add(padId);
      // after note duration, make it inactive
      setTimeout(() => {
        const padId = noteToPadId(note);
        if (!padId) {
          return;
        }
        del(padId);
      }, sequencer.noteDuration.ms / 2);
    };
    sequencer.addEventListener(sequencer.NOTE_EVENT, listener);
    return () => sequencer.removeEventListener(sequencer.NOTE_EVENT, listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePads.add, activePads.delete]);

  return {
    activePads,
    setPadActive: add,
    setPadInactive: del,
  };
};
