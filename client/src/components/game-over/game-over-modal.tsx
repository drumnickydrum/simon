import { useCallback, useEffect, useState } from 'react';
import { Modal } from '../ui-elements/modal';
import { ANIMATION_DURATION } from '../../config';
import { NewHighScore } from './new-high-score';
import { CurrentHighScore } from '../shared/current-high-score';
import type { HighScoreEntry } from '@simon/shared';
import { useUpdateHighScoreApi } from '../../services/api.high-score';

export interface GameOverModalProps {
  isGameOver: boolean;
  userScore: number;
  currentHighScore: HighScoreEntry | undefined;
  isNewHighScore: boolean;
  goToNewGameState: () => void;
  padKeyListeners: { pause: () => void; resume: () => void };
}

export const GameOverModal = (props: GameOverModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    props.padKeyListeners.pause();
  }, [props.padKeyListeners]);

  /** To close the modal, use props.goToNewGameState. closeModal will be called
   * in useEffect to respond to the change in game state. This is to prevent
   * complex checks on whether or not to show the modal. */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    props.padKeyListeners.resume();
  }, [props.padKeyListeners]);

  useEffect(() => {
    if (props.isGameOver && !isModalOpen) {
      openModal();
    }
  }, [isModalOpen, openModal, props.isGameOver]);

  useEffect(() => {
    if (isModalOpen && !props.isGameOver) {
      closeModal();
    }
  }, [closeModal, isModalOpen, props.isGameOver]);

  const [error, setError] = useState('');

  const updateHighScoreApi = useUpdateHighScoreApi({
    onSuccess: props.goToNewGameState,
    onError: (reason: string) => setError(reason),
  });

  const onSubmit = (name: string) => {
    setError('');
    updateHighScoreApi.mutate({ name, score: props.userScore });
  };

  if (!isModalOpen) {
    // reset everything after the modal closes
    setTimeout(() => {
      updateHighScoreApi.reset();
    }, ANIMATION_DURATION);
  }

  const showNewHighScore =
    props.isNewHighScore ||
    // the line above will be falsy if the user's update to high score is
    // successful (and the query re-validates), so to prevent a "game over"
    // flash, check if their update succeeded
    updateHighScoreApi.isSuccess;

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={props.goToNewGameState}
      className="max-w-xl"
    >
      {showNewHighScore ? (
        <NewHighScore
          error={error}
          onSubmit={onSubmit}
          // Disable the form while mutation is pending
          disabled={updateHighScoreApi.isPending}
          pending={
            // Keep a pending state on success because we are animating away the modal. This will prevent a flash.
            updateHighScoreApi.isPending || !!updateHighScoreApi.isSuccess
          }
        />
      ) : (
        <div>
          <h3 className="font-bold mb-1 text-xl">💥 GAME OVER 💥</h3>
          <p className="mb-4">
            Your score is {props.userScore}. Try again to beat the global high
            score!
          </p>
          <CurrentHighScore highScore={props.currentHighScore} />
        </div>
      )}
    </Modal>
  );
};
