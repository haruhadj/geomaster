import { useState, useEffect, useCallback, useRef } from 'react';
import { Country, countries } from '../data/countries';
import { useGameStore } from '../store/useGameStore';

export interface Question {
  country: Country;
  options: string[];
  type: 'FLAG_TO_NAME' | 'NAME_TO_CAPITAL' | 'CAPITAL_TO_NAME';
}

export const useGameEngine = () => {
  const { selectedRegion, gameMode, isPlaying, sessionLength, endGame } = useGameStore();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const sessionPool = useRef<Country[]>([]);

  const filterCountries = useCallback(() => {
    if (selectedRegion === 'All') return countries;
    return countries.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

  const shuffleAndSlice = useCallback(() => {
    const filtered = filterCountries();
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    if (sessionLength === 'Endless') {
      sessionPool.current = shuffled;
    } else if (sessionLength === 'All') {
      sessionPool.current = shuffled;
    } else {
      sessionPool.current = shuffled.slice(0, sessionLength);
    }
    setCurrentIndex(0);
  }, [filterCountries, sessionLength]);

  const generateQuestion = useCallback((index: number): Question | null => {
    if (sessionLength !== 'Endless' && index >= sessionPool.current.length) {
      return null;
    }

    // For endless mode, we might need to reshuffle if we run out
    let country: Country;
    if (sessionLength === 'Endless') {
      country = sessionPool.current[index % sessionPool.current.length];
      if (index > 0 && index % sessionPool.current.length === 0) {
        // Reshuffle for variety in endless
        sessionPool.current = [...sessionPool.current].sort(() => Math.random() - 0.5);
      }
    } else {
      country = sessionPool.current[index];
    }

    if (!country) return null;
    
    let type: Question['type'] = 'FLAG_TO_NAME';
    if (gameMode === 'CAPITALS') {
      type = Math.random() > 0.5 ? 'NAME_TO_CAPITAL' : 'CAPITAL_TO_NAME';
    } else if (gameMode === 'MIXED') {
      const rand = Math.random();
      if (rand < 0.33) type = 'FLAG_TO_NAME';
      else if (rand < 0.66) type = 'NAME_TO_CAPITAL';
      else type = 'CAPITAL_TO_NAME';
    }

    // Generate smart distractors from the same region
    const availableCountries = filterCountries();
    const regionCountries = availableCountries.filter((c) => c.id !== country.id);
    const shuffledRegion = [...regionCountries].sort(() => Math.random() - 0.5);
    const distractors = shuffledRegion.slice(0, 3).map((c) => {
      if (type === 'NAME_TO_CAPITAL') return c.capital;
      return c.name.common;
    });

    const correctAnswer = type === 'NAME_TO_CAPITAL' ? country.capital : country.name.common;
    const options = [...distractors, correctAnswer].sort(() => Math.random() - 0.5);

    return { country, options, type };
  }, [filterCountries, gameMode, sessionLength]);

  const next = useCallback(() => {
    const nextIdx = currentIndex + 1;
    
    if (sessionLength !== 'Endless' && nextIdx >= sessionPool.current.length) {
      endGame();
      return;
    }

    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setCurrentIndex(nextIdx);
      setNextQuestion(generateQuestion(nextIdx + 1));
    } else {
      const q1 = generateQuestion(currentIndex);
      const q2 = generateQuestion(currentIndex + 1);
      setCurrentQuestion(q1);
      setNextQuestion(q2);
    }
  }, [currentIndex, endGame, generateQuestion, nextQuestion, sessionLength]);

  useEffect(() => {
    if (isPlaying) {
      shuffleAndSlice();
    } else {
      setCurrentQuestion(null);
      setNextQuestion(null);
      setCurrentIndex(0);
    }
  }, [isPlaying, shuffleAndSlice]);

  useEffect(() => {
    if (isPlaying && !currentQuestion && sessionPool.current.length > 0) {
      next();
    }
  }, [isPlaying, currentQuestion, next]);

  const checkAnswer = (answer: string): boolean => {
    if (!currentQuestion) return false;

    const { country, type } = currentQuestion;
    const normalizedAnswer = answer.trim().toLowerCase();

    if (type === 'NAME_TO_CAPITAL') {
      return normalizedAnswer === country.capital.toLowerCase();
    } else {
      return country.name.accepted.some(
        (acc) => acc.toLowerCase() === normalizedAnswer
      ) || country.name.common.toLowerCase() === normalizedAnswer;
    }
  };

  return {
    currentQuestion,
    nextQuestion,
    currentIndex,
    totalQuestions: sessionLength === 'Endless' ? Infinity : sessionPool.current.length,
    next,
    checkAnswer,
  };
};
