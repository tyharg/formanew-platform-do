/**
 * Extracts the file name from a URL.
 *
 * @param url - Full URL of the file.
 * @returns The filename or the original value if there is no URL.
 */
export const getFileNameFromUrl = (url?: string | null) => {
  if (!url) return url;

  const parsedUrl = new URL(url);
  const segments = parsedUrl.pathname.split('/');
  return segments[segments.length - 1];
};
