import { useState, useEffect, useRef } from 'react';

export const useThrottledSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [throttledValue, setThrottledValue] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastExecRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const timeUntilNextExec = Math.max(0, delay - (now - lastExecRef.current));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setThrottledValue(searchTerm);
      lastExecRef.current = now;
    }, timeUntilNextExec);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    setSearchTerm,
    throttledValue
  };
};