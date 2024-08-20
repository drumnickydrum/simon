import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGameMachine } from './components/use-game-machine';
import { GameOverModal } from './components/game-over-modal';
import { usePadController } from './components/use-pad-controller';
import { useGetHighScoreApi } from './services/api.high-score';
import { initMonitoring } from './services/monitor.init';
import * as Sentry from '@sentry/react';
import { Button } from './components/ui.button';
import { HighScoreDisplay } from './components/high-score-display';
import { Pads } from './components/pads';
import { initAudioContext } from './services/synth.init';

initMonitoring();
initAudioContext();

const queryClient = new QueryClient();

export default function App() {
  return (
    <Sentry.ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Simon />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

function Simon() {
  const getHighScoreApi = useGetHighScoreApi();
  const gameMachine = useGameMachine({
    currentHighScore: getHighScoreApi.data,
  });
  const padController = usePadController({
    onUserPadDown: gameMachine.actions.input,
    disabled: gameMachine.isComputerTurn,
  });
  return (
    <main className="font-sans text-slate-200 overflow-hidden fixed h-dvh w-full touch-none bg-gradient-to-b from-slate-700 to-sky-950 flex items-center justify-center">
      <div className="w-full h-full flex flex-col landscape:flex-row max-w-screen-2xl items-center justify-evenly">
        <div className="h-24 landscape:h-auto w-full flex items-center justify-center">
          {!gameMachine.isPlaying && (
            <HighScoreDisplay getHighScoreApi={getHighScoreApi} />
          )}
        </div>
        <div>
          <Pads
            isPlaying={gameMachine.isPlaying}
            isUserTurn={gameMachine.isUserTurn}
            currentScore={gameMachine.currentScore}
            padController={padController}
          />
        </div>
        <div className="h-24 landscape:h-auto w-full flex items-center justify-center">
          {!gameMachine.isPlaying && (
            <Button onClick={gameMachine.actions.startNewGame}>
              <span className="text-xl md:text-2xl font-bold">start</span>
            </Button>
          )}
        </div>
      </div>
      {gameMachine.isGameOver && (
        <GameOverModal
          userScore={gameMachine.userScore}
          getHighScoreApi={getHighScoreApi}
          isNewHighScore={gameMachine.isNewHighScore}
          onModalClose={() => gameMachine.actions.transition({ to: 'newGame' })}
          padKeyListeners={padController.padKeyListeners}
        />
      )}
    </main>
  );
}
