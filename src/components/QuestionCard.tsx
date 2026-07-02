import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '../hooks/useGameEngine';
import { useGameStore } from '../store/useGameStore';
import { cn } from '../lib/utils';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  isCorrect: boolean | null;
  key?: React.Key;
}

export const QuestionCard = ({ question, onAnswer, isCorrect }: QuestionCardProps) => {
  const { inputMethod } = useGameStore();
  const [typedAnswer, setTypedAnswer] = useState('');

  useEffect(() => {
    setTypedAnswer('');
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedAnswer.trim()) {
      onAnswer(typedAnswer);
    }
  };

  const getQuestionText = () => {
    switch (question.type) {
      case 'FLAG_TO_NAME':
        return 'Which country does this flag belong to?';
      case 'NAME_TO_CAPITAL':
        return `What is the capital of ${question.country.name.common}?`;
      case 'CAPITAL_TO_NAME':
        return `Which country has ${question.country.capital} as its capital?`;
      default:
        return '';
    }
  };

  return (
    <motion.div
      key={question.country.id}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "w-full max-w-md bg-gray-900 border-2 border-gray-800 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden",
        isCorrect === true && "border-green-500/50 shadow-green-500/20",
        isCorrect === false && "border-red-500/50 shadow-red-500/20 animate-shake"
      )}
    >
      <div className="flex flex-col items-center gap-4 md:gap-8">
        <div className="text-center">
          <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mb-1 md:mb-2">Question</p>
          <h2 className="text-lg md:text-xl font-medium text-white leading-tight">{getQuestionText()}</h2>
        </div>

        {question.type === 'FLAG_TO_NAME' && (
          <div className="w-full aspect-[3/2] rounded-lg md:rounded-xl overflow-hidden shadow-lg border border-gray-800">
            <img
              src={question.country.flag}
              alt="Flag"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="w-full">
          {inputMethod === 'CHOICE' ? (
            <div className="grid grid-cols-1 gap-2 md:gap-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onAnswer(option)}
                  disabled={isCorrect !== null}
                  className={cn(
                    "w-full py-3 md:py-4 px-4 md:px-6 rounded-lg md:rounded-xl text-left text-sm md:text-base font-medium transition-all duration-200 border-2",
                    "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600",
                    isCorrect !== null && option === (question.type === 'NAME_TO_CAPITAL' ? question.country.capital : question.country.name.common) && "bg-green-500/20 border-green-500 text-green-400",
                    isCorrect === false && option === typedAnswer && "bg-red-500/20 border-red-500 text-red-400"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <input
                autoFocus
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={isCorrect !== null}
                placeholder="Type your answer..."
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg md:rounded-xl py-3 md:py-4 px-4 md:px-6 text-white text-sm md:text-base placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isCorrect !== null || !typedAnswer.trim()}
                className="w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-lg md:rounded-xl transition-colors"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Feedback Overlays */}
      <AnimatePresence>
        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/10 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
              CORRECT!
            </div>
          </motion.div>
        )}
        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
              WRONG
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
