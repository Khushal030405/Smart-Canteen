// For Vercel serverless, use relative API paths
export const getApiUrl = (path = '') => {
  if (!path) return '/api';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/api${normalizedPath}`;
};
