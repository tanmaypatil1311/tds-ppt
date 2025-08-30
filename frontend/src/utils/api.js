import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again with shorter content.');
    }
    
    if (error.response?.status === 413) {
      throw new Error('File too large. Please use a smaller template file.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error(error.message || 'An unexpected error occurred');
  }
);

export const generatePresentation = {
  // Analyze text and create slide structure
  analyzeText: async ({ text, guidance, provider, apiKey }) => {
    try {
      const response = await api.post('/api/analyze-text', {
        text,
        guidance,
        provider,
        apiKey
      });
      return response.data;
    } catch (error) {
      console.error('Text analysis failed:', error);
      throw error;
    }
  },

  // Analyze uploaded template
  analyzeTemplate: async (templateFile, sessionId) => {
    try {
      const formData = new FormData();
      formData.append('template', templateFile);
      formData.append('session_id', sessionId);

      const response = await api.post('/api/analyze-template', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Template analysis failed:', error);
      throw error;
    }
  },

  // Generate speaker notes
  generateSpeakerNotes: async ({ session_id, provider, apiKey }) => {
    try {
      const response = await api.post('/api/generate-speaker-notes', {
        session_id,
        provider,
        apiKey
      });
      return response.data;
    } catch (error) {
      console.error('Speaker notes generation failed:', error);
      throw error;
    }
  },

  // Generate final presentation
  generatePresentation: async ({ session_id, options }) => {
    try {
      const response = await api.post('/api/generate-presentation', {
        session_id,
        options
      }, {
        responseType: 'blob', // Important for file download
        timeout: 120000, // 2 minutes for generation
      });
      
      return response.data;
    } catch (error) {
      console.error('Presentation generation failed:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

// Utility functions
export const utils = {
  // Validate API key format
  validateApiKey: (apiKey, provider) => {
    if (!apiKey) return { valid: false, message: 'API key is required' };
    
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{32,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9\-_]{32,}$/,
      gemini: /^AIza[a-zA-Z0-9\-_]{35}$/
    };

    const pattern = patterns[provider];
    if (pattern && !pattern.test(apiKey)) {
      return { 
        valid: false, 
        message: `Invalid ${provider} API key format` 
      };
    }

    return { valid: true, message: '' };
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Estimate reading time
  estimateReadingTime: (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  },

  // Estimate slide count from text
  estimateSlideCount: (text) => {
    const words = text.trim().split(/\s+/).length;
    // Rough estimate: 150-200 words per slide
    return Math.max(1, Math.ceil(words / 175));
  },

  // Download file with error handling
  downloadFile: (blob, filename) => {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  },

  // Debounce function for input handling
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Local storage helpers (with error handling)
  storage: {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  }
};

export default api;