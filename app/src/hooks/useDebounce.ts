import { useEffect, useRef } from 'react';

type Timer = ReturnType<typeof setTimeout>;
type Callback = (...args: any[]) => void;

export function useDebounce<T extends Callback>(callback: T, delay = 1000) {
  const timer = useRef<Timer | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timer.current === undefined) return;
      clearTimeout(timer.current);
    };
  }, []);

  const debouncedFunction = ((...args: Parameters<T>) => {
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = newTimer;
  }) as T;

  return debouncedFunction;
}
