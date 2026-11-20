/**
 * Normalizes asset and upload URLs between frontend and backend.
 * Handles data: URLs, absolute http(s) URLs, and relative /uploads/... URLs.
 * @param {string} url
 * @returns {string}
 */
export function getAssetUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  // Strip trailing /api/v1 or /api to reach backend root where /uploads is statically served
  const backendBase = rawApi.replace(/\/api(\/v\d+)?\/?$/, '').replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
}

export default getAssetUrl;
