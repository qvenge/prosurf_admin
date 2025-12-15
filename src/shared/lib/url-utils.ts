/**
 * URL utility functions for handling API URLs and paths
 */

/**
 * Joins API base URL with a relative path
 * - Only transforms relative URLs (not starting with http:// or https://)
 * - Handles null/undefined gracefully
 * - Properly handles leading/trailing slashes
 *
 * @param path - The path to join with API base URL (can be null/undefined)
 * @param baseUrl - Optional base URL override (defaults to VITE_API_URL)
 * @returns Full URL or null if input is null/undefined
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

  // If already an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Get base URL from environment or parameter
  const base = baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Remove trailing slash from base
  const normalizedBase = base.replace(/\/$/, '');

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Transforms an array of URL paths to full URLs
 *
 * @param paths - Array of paths (can be null/undefined)
 * @param baseUrl - Optional base URL override
 * @returns Array of full URLs (null items are filtered out)
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
