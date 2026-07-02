import { useGameStore } from '../store/useGameStore';
import { Trophy, Heart, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export const ScoreBoard = () => {
  const { score, streak, lives, bestStreak } = useGameStore();

  return (
    <div className="flex items-center justify-between w-full max-w-2xl px-2 md:px-4 py-4 md:py-6 text-white gap-2">
      <div className="flex flex-col items-center flex-1">
        <div className="flex items-center gap-1 md:gap-2 text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1">
          <Trophy size={12} className="md:w-[14px] md:h-[14px]" /> <span className="hidden xs:inline">Score</span>
        </div>
        <div className="text-xl md:text-3xl font-mono font-bold">{score.toLocaleString()}</div>
      </div>

      <div className="flex flex-col items-center flex-1">
        <div className="flex items-center gap-1 md:gap-2 text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1">
          <Zap size={12} className="text-yellow-400 md:w-[14px] md:h-[14px]" /> <span className="hidden xs:inline">Streak</span>
        </div>
        <div className="text-xl md:text-3xl font-mono font-bold flex items-baseline gap-1 md:gap-2">
          {streak}
          <span className="text-[10px] md:text-xs text-gray-500 font-sans hidden sm:inline">Best: {bestStreak}</span>
        </div>
      </div>

      <div className="flex flex-col items-center flex-1">
        <div className="flex items-center gap-1 md:gap-2 text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1">
          <Heart size={12} className="text-red-500 md:w-[14px] md:h-[14px]" /> <span className="hidden xs:inline">Lives</span>
        </div>
        <div className="flex gap-0.5 md:gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              size={16}
              className={cn(
                "md:w-5 md:h-5",
                i < lives ? "fill-red-500 text-red-500" : "text-gray-700"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
