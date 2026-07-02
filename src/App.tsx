import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useGameStore } from './store/useGameStore';
import { useGameEngine } from './hooks/useGameEngine';
import { ScoreBoard } from './components/ScoreBoard';
import { QuestionCard } from './components/QuestionCard';
import { Timer } from './components/Timer';
import { SettingsOverlay } from './components/SettingsOverlay';
import { ResultsModal } from './components/ResultsModal';
import { Globe, LogOut } from 'lucide-react';
import {
  createHistoryEntry,
  loadProgress,
  mergeProgress,
  postToParent,
  recordCompletedGame,
  saveProgress,
  withSettings,
} from './lib/skillforgeBridge';

export default function App() {
  const {
    bestStreak,
    gameMode,
    handleCorrect,
    handleWrong,
    inputMethod,
    isGameOver,
    isPlaying,
    isTimed,
    missedCountries,
    resetGame,
    score,
    selectedRegion,
    sessionLength,
    setSettings,
  } = useGameStore();
  const { currentQuestion, nextQuestion, checkAnswer, next, currentIndex, totalQuestions } = useGameEngine();

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionKey, setQuestionKey] = useState(0);
  const [progress, setProgress] = useState(() => loadProgress());
  const hasReportedGameOverRef = useRef(false);

  const handleAnswer = (answer: string) => {
    if (isCorrect !== null) return;

    const correct = checkAnswer(answer);
    setIsCorrect(correct);

    const secondsTaken = (Date.now() - startTime) / 1000;

    setTimeout(() => {
      if (correct) {
        handleCorrect(secondsTaken);
      } else {
        handleWrong(currentQuestion.country);
      }

      if (!useGameStore.getState().isGameOver) {
        setIsCorrect(null);
        setStartTime(Date.now());
        setQuestionKey(prev => prev + 1);
        next();
      }
    }, 1000);
  };

  const handleTimeUp = () => {
    if (isCorrect !== null || !currentQuestion) return;
    setIsCorrect(false);
    setTimeout(() => {
      handleWrong(currentQuestion.country);
      if (!useGameStore.getState().isGameOver) {
        setIsCorrect(null);
        setStartTime(Date.now());
        setQuestionKey(prev => prev + 1);
        next();
      }
    }, 1000);
  };

  useEffect(() => {
    if (isPlaying) {
      setStartTime(Date.now());
    }
  }, [isPlaying, questionKey]);

  useEffect(() => {
    setSettings(progress.settings);
    postToParent('REQUEST_PROGRESS');

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const msg = event.data;
      if (!msg || msg.type !== 'RESTORE_PROGRESS' || !msg.data) {
        return;
      }

      const mergedProgress = mergeProgress(loadProgress(), msg.data);
      saveProgress(mergedProgress);
      setProgress(mergedProgress);
      setSettings(mergedProgress.settings);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setSettings]);

  useEffect(() => {
    const nextProgress = withSettings(progress, {
      gameMode,
      inputMethod,
      isTimed,
      selectedRegion,
      sessionLength,
    });

    if (nextProgress === progress) {
      return;
    }

    saveProgress(nextProgress);
    setProgress(nextProgress);
  }, [gameMode, inputMethod, isTimed, progress, selectedRegion, sessionLength]);

  useEffect(() => {
    if (!isGameOver) {
      hasReportedGameOverRef.current = false;
      return;
    }

    if (hasReportedGameOverRef.current) {
      return;
    }

    hasReportedGameOverRef.current = true;

    const updatedProgress = recordCompletedGame(
      withSettings(progress, {
        gameMode,
        inputMethod,
        isTimed,
        selectedRegion,
        sessionLength,
      }),
      createHistoryEntry({
        score,
        bestStreak,
        missedCount: missedCountries.length,
        questionsCompleted: currentIndex + 1,
        totalQuestions: Number.isFinite(totalQuestions) ? totalQuestions : null,
        settings: {
          gameMode,
          inputMethod,
          isTimed,
          selectedRegion,
          sessionLength,
        },
      }),
    );

    saveProgress(updatedProgress);
    setProgress(updatedProgress);
    postToParent('BEST_SCORE', { bestScore: updatedProgress.bestScore });
    postToParent('GAME_STATS', updatedProgress);
  }, [
    bestStreak,
    currentIndex,
    gameMode,
    inputMethod,
    isGameOver,
    isTimed,
    missedCountries.length,
    progress,
    score,
    selectedRegion,
    sessionLength,
    totalQuestions,
  ]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start md:justify-center relative overflow-x-hidden overflow-y-auto py-4 md:py-6">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {!isPlaying && !isGameOver && <SettingsOverlay />}
        {isGameOver && <ResultsModal />}
      </AnimatePresence>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-4 md:gap-8 p-4 pb-8">
        {isPlaying && (
          <button
            onClick={resetGame}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 bg-gray-900/50 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full transition-all border border-gray-800 hover:border-red-500/50 group z-20"
            title="Quit Game"
          >
            <LogOut size={18} className="md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}
        <header className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-white">
            <Globe className="text-blue-500 animate-pulse" />
            <h1 className="text-2xl font-black italic tracking-tighter">GEOMASTER</h1>
          </div>
          <ScoreBoard />
          {isPlaying && totalQuestions !== Infinity && (
            <div className="w-full max-w-md px-4">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2">
                <span>Progress</span>
                <span>{currentIndex + 1} / {totalQuestions}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          )}
          {isTimed && isPlaying && (
            <div className="w-full max-w-md">
              <Timer 
                duration={10} 
                onTimeUp={handleTimeUp} 
                isActive={isPlaying && isCorrect === null} 
                resetKey={questionKey}
              />
            </div>
          )}
        </header>

        <main className="w-full flex justify-center">
          <AnimatePresence mode="wait">
            {isPlaying && currentQuestion && (
              <QuestionCard
                key={questionKey}
                question={currentQuestion}
                onAnswer={handleAnswer}
                isCorrect={isCorrect}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Preload next flag */}
        {nextQuestion?.type === 'FLAG_TO_NAME' && (
          <img 
            src={nextQuestion.country.flag} 
            className="hidden" 
            aria-hidden="true" 
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </div>
  );
}
