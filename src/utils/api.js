const normalizeBaseUrl = (url) => {
  if (!url) return null;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_BASE_URL) || 'http://localhost:5000';

export const getApiUrl = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export default API_BASE_URL;
