/**
 * Объединяет базовый URL API с относительным путём.
 * - Преобразует только относительные URL (не начинающиеся с http:// или https://)
 * - Корректно обрабатывает null/undefined
 * - Правильно работает с начальными/конечными слэшами
 *
 * @param path - Путь для объединения с базовым URL API (может быть null/undefined)
 * @param baseUrl - Опциональное переопределение базового URL (по умолчанию VITE_API_URL)
 * @returns Полный URL или null если входное значение null/undefined
 *
 * @example
 * joinApiUrl('/uploads/image.jpg') // => 'http://localhost:3000/uploads/image.jpg'
 * joinApiUrl('https://cdn.example.com/image.jpg') // => 'https://cdn.example.com/image.jpg'
 * joinApiUrl(null) // => null
 */
export function joinApiUrl(path: string | null | undefined, baseUrl?: string): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const base = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Преобразует массив путей в полные URL.
 *
 * @param paths - Массив путей (может быть null/undefined)
 * @param baseUrl - Опциональное переопределение базового URL
 * @returns Массив полных URL (null-элементы отфильтровываются)
 */
export function joinApiUrls(
  paths: (string | null | undefined)[] | null | undefined,
  baseUrl?: string
): string[] {
  if (!paths) {
    return [];
  }

  return paths
    .map(path => joinApiUrl(path, baseUrl))
    .filter((url): url is string => url !== null);
}

export function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
