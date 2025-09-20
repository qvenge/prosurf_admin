/* eslint-disable @typescript-eslint/no-explicit-any */

import { canUseDOM } from './dom';

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export function throttle<T extends any[]>(
  fn: (...args: T) => unknown,
  threshold = 50,
  scope = canUseDOM ? window : undefined,
) {
  let prevDate: number = Date.now() - threshold;
  let timeoutId: ReturnType<typeof setTimeout>;

  const throttledFn = (...args: T) => {
    const timeLeft = prevDate + threshold - Date.now();

    clearTimeout(timeoutId);
    if (timeLeft > 0) {
      timeoutId = setTimeout(() => {
        prevDate = Date.now();
        fn.apply(scope, args);
      }, timeLeft);
      return;
    }

    prevDate = Date.now();
    fn.apply(scope, args);
  };

  throttledFn.cancel = () => {
    clearTimeout(timeoutId);
  };

  return throttledFn;
}

export function debounce<T extends any[]>(
  fn: (...args: T) => unknown,
  delay: number,
  context = canUseDOM ? window : undefined,
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  let args: T;

  const later = () => fn.apply(context, args);
  const debouncedFn = (...a: T) => {
    args = a;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delay);
  };

  debouncedFn.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debouncedFn;
}

export const callMultiple =
  (...fns: any) =>
    (...args: any) =>
      fns.filter((f: any) => typeof f === 'function').forEach((f: any) => f(...args));

  
export function callWithLimit<R>(
  func: (...args: unknown[]) => R | Promise<R>,
  args: unknown[],
  limit: number = Infinity
): Promise<PromiseSettledResult<Awaited<R>>[]> {
  return new Promise((resolve) => {
    const results: any[] = [];
    let pointer = 0;
  
    for (; pointer < args.length && pointer < limit; ++pointer) {
      callAndInsert(pointer);
    }

    function callAndInsert(index: number) {
      const argArray = Array.isArray(args[index]) ? args[index] as unknown[] : [args[index]];
      results[index] = Promise.resolve(func(...argArray))
        .finally(() => {
          pointer++;
      
          if (pointer < args.length) {
            callAndInsert(pointer);
          } else {
            resolve(Promise.allSettled<R[]>(results));
          }
        })
    }
  });
}