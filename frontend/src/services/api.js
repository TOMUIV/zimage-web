/**
 * API service for backend communication.
 */
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:15000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout
});

/**
 * Image generation API
 */
export const generateAPI = {
  /**
   * Create a new image generation task
   */
  createTask: async (params) => {
    const response = await api.post('/generate', params);
    return response.data;
  },

  /**
   * Get task status
   */
  getTaskStatus: async (taskId) => {
    const response = await api.get(`/generate/${taskId}`);
    return response.data;
  },
};

/**
 * History API
 */
export const historyAPI = {
  /**
   * Get image history
   */
  getHistory: async (page = 1, pageSize = 20) => {
    const response = await api.get('/history', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  /**
   * Download image
   */
  downloadImage: async (imageId) => {
    const response = await api.get(`/download/${imageId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get latest image
   */
  getLatestImage: async () => {
    const response = await api.get('/images/latest');
    return response.data;
  },

  /**
   * Delete image
   */
  deleteImage: async (imageId) => {
    const response = await api.delete(`/images/${imageId}`);
    return response.data;
  },
};

/**
 * System API
 */
export const systemAPI = {
  /**
   * Get system status
   */
  getSystemStatus: async () => {
    const response = await api.get('/system/status');
    return response.data;
  },
};

export default api;