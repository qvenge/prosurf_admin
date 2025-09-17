/* eslint-disable @typescript-eslint/no-explicit-any */

export const isObjectLike = (object: any): boolean => {
  return typeof object === 'object' && object !== null;
};

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[] | K): Omit<T, K> {
  const keySet = new Set<keyof T>(Array.isArray(keys) ? keys : [keys]);
  
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keySet.has(key as K))
  ) as Omit<T, K>;
}