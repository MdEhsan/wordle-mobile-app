import axiosInstance from './api.config';
import { RequestConfig } from './api.types';

/**
 * GET request
 * @param endpoint - API endpoint
 * @param config - Request configuration
 * @returns Response data
 */
const get = async <T = any>(
  endpoint: string,
  config?: RequestConfig
): Promise<T> => {
  const response = await axiosInstance.get<T>(endpoint, {
    headers: config?.headers,
  });
  return response.data;
};

/**
 * POST request
 * @param endpoint - API endpoint
 * @param data - Request body
 * @param config - Request configuration
 * @returns Response data
 */
const post = async <T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  const response = await axiosInstance.post<T>(endpoint, data, {
    headers: config?.headers,
  });
  return response.data;
};

/**
 * PUT request
 * @param endpoint - API endpoint
 * @param data - Request body
 * @param config - Request configuration
 * @returns Response data
 */
const put = async <T = any>(
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  const response = await axiosInstance.put<T>(endpoint, data, {
    headers: config?.headers,
  });
  return response.data;
};

export const apiService = {
  get,
  post,
  put,
};

export default apiService;
